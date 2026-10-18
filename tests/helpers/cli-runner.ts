import { execa } from "execa";
import * as CONST from "@/constants";
import * as interfaces from "@/interface";

function parseArgs(command: string): string[] {
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const args: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(command)) !== null) {
    if (match[1] !== undefined) {
      args.push(match[1]);
    } else if (match[2] !== undefined) {
      args.push(match[2]);
    } else if (match[0] !== undefined) {
      args.push(match[0]);
    }
  }
  return args;
}

export async function executeCLI(
  command: string,
  options: interfaces.CLIOptions = {},
): Promise<interfaces.CLIResult> {
  const {
    input,
    timeout = 15000,
    expectSuccess = true,
    cwd = CONST.BASE_DIR,
  } = options;

  const args = command ? parseArgs(command) : [];
  const fullArgs = [
    CONST.TSX_CLI_PATH,
    "-r",
    CONST.TSCONFIG_PATHS_REGISTER,
    CONST.CLI_PATH,
    ...args,
  ];

  try {
    const child = execa(process.execPath, fullArgs, {
      timeout,
      cwd,
      reject: false,
      all: true,
      env: {
        ...process.env,
        NODE_ENV: "development",
        TS_NODE_PROJECT: CONST.TSCONFIG_PATH,
      },
    });

    let isFinished = false;
    child.finally(() => {
      isFinished = true;
    });

    const handled = new Set<string>();

    const onData = (chunk: Buffer | string) => {
      if (!child.stdin || isFinished) return;
      const text = chunk.toString();

      if (
        text.includes("Select environment files") &&
        !handled.has("selectFiles")
      ) {
        handled.add("selectFiles");
        setTimeout(() => {
          if (child.stdin && !isFinished) {
            child.stdin.write(" \r");
          }
        }, 120);
      } else if (
        text.includes("Select files to install") &&
        !handled.has("selectInstall")
      ) {
        handled.add("selectInstall");
        setTimeout(() => {
          if (child.stdin && !isFinished) {
            child.stdin.write("\r");
          }
        }, 120);
      } else if (text.includes("Expiration duration") && !handled.has("exp")) {
        handled.add("exp");
        setTimeout(() => {
          if (child.stdin && !isFinished) {
            child.stdin.write("\r");
          }
        }, 120);
      } else if (text.includes("Enter password") && !handled.has("pwd")) {
        handled.add("pwd");
        const pwd =
          input && !input.startsWith("\n")
            ? (input.split("\n")[0] ?? "testpass123")
            : "testpass123";
        setTimeout(() => {
          if (child.stdin && !isFinished) {
            child.stdin.write(`${pwd}\r`);
          }
        }, 120);
      } else if (
        text.includes("Confirm password") &&
        !handled.has("confirmPwd")
      ) {
        handled.add("confirmPwd");
        const pwd =
          input && !input.startsWith("\n")
            ? (input.split("\n")[0] ?? "testpass123")
            : "testpass123";
        setTimeout(() => {
          if (child.stdin && !isFinished) {
            child.stdin.write(`${pwd}\r`);
          }
        }, 120);
      } else if (text.includes("Reference label") && !handled.has("ref")) {
        handled.add("ref");
        setTimeout(() => {
          if (child.stdin && !isFinished) {
            child.stdin.write("\r");
          }
        }, 120);
      } else if (
        /Create this|Proceed with|Are you sure|Remove password/.test(text) &&
        !handled.has("confirm")
      ) {
        handled.add("confirm");
        const answer = input && input.trim().startsWith("n") ? "n\r" : "y\r";
        setTimeout(() => {
          if (child.stdin && !isFinished) {
            child.stdin.write(answer);
          }
        }, 120);
      }
    };

    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);

    const result = await child;

    const exitCode = result.exitCode ?? 0;
    const success = expectSuccess ? exitCode === 0 : exitCode !== 0;

    return {
      success,
      exitCode,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      output: result.all || `${result.stdout || ""}${result.stderr || ""}`,
    };
  } catch (error: any) {
    const exitCode = typeof error?.exitCode === "number" ? error.exitCode : -1;
    const success = expectSuccess ? exitCode === 0 : exitCode !== 0;

    return {
      success,
      exitCode,
      stdout: error?.stdout || "",
      stderr: error?.stderr || error?.message || "",
      output:
        error?.all ||
        `${error?.stdout || ""}${error?.stderr || ""}` ||
        error?.message ||
        "",
    };
  }
}
