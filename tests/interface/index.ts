export interface TrackedEnvLink {
  type: "password" | "optional";
  id: string;
  password?: string | undefined;
}

export interface CLIResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  output: string;
}

export interface CLIOptions {
  input?: string | undefined;
  timeout?: number | undefined;
  expectSuccess?: boolean | undefined;
  cwd?: string | undefined;
}

export interface InfoData {
  id?: string | undefined;
  status?: string | undefined;
  filesCount?: number | undefined;
  installCount?: number | undefined;
  createdAt?: string | undefined;
  expiresAt?: string | undefined;
  reference?: string | undefined;
  type?: "password" | "optional-password" | undefined;
}
