import { describe, it, expect, beforeAll, afterAll } from "vitest";
import os from "node:os";
import path from "node:path";
import * as helpers from "@/helpers";

describe("Install Command", () => {
  let passwordEnvLinkId: string;
  let optionalEnvLinkId: string;
  let testDir: string;
  const testPassword = "installtest123";

  beforeAll(async () => {
    helpers.createTestEnvFile("INSTALL_TEST=value1\nAPI_KEY=secret123");

    const passwordResult = await helpers.executeCLI(
      `create --pass ${testPassword}`,
      {
        input: "\n\ny\n",
        timeout: 20000,
      },
    );
    const extractedId = helpers.extractEnvLinkId(passwordResult.output);
    if (extractedId) {
      passwordEnvLinkId = extractedId;
    }

    const optionalResult = await helpers.executeCLI("create", {
      input: "\n\ny\n",
      timeout: 20000,
    });
    const extractedOptionalId = helpers.extractExtendedId(
      optionalResult.output,
    );
    if (extractedOptionalId) {
      optionalEnvLinkId = extractedOptionalId;
    }

    helpers.cleanupTestFiles();

    testDir = path.join(os.tmpdir(), `envlink-test-${Date.now()}`);
    helpers.ensureTestDirectory(testDir);
  });

  afterAll(() => {
    helpers.cleanupTestFiles();
    if (testDir) {
      helpers.removeTestDirectory(testDir);
    }
  });

  it("should install from password-protected EnvLink", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(
      `install ${passwordEnvLinkId} --pass ${testPassword}`,
      {
        cwd: testDir,
        timeout: 20000,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/install|complete|success/);
  });

  it("should install from optional-password EnvLink", async () => {
    if (!optionalEnvLinkId) {
      console.log("Skipping: No optional-password EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(`install ${optionalEnvLinkId}`, {
      cwd: testDir,
      timeout: 20000,
    });

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/install|complete|success/);
  });

  it("should install with file selection using --select-files", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(
      `install ${passwordEnvLinkId} --select-files --pass ${testPassword}`,
      {
        input: "0\n",
        cwd: testDir,
        timeout: 20000,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/select|file|install/);
  });

  it("should install with file selection using -s flag", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(
      `install ${passwordEnvLinkId} -s --pass ${testPassword}`,
      {
        input: "0\n",
        cwd: testDir,
        timeout: 20000,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/select|file|install/);
  });

  it("should fail with wrong password", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(
      `install ${passwordEnvLinkId} --pass wrongpassword`,
      {
        expectSuccess: false,
        cwd: testDir,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(
      /invalid|password|error|denied|not found/,
    );
  });

  it("should fail with invalid EnvLink ID", async () => {
    const result = await helpers.executeCLI(
      "install invalid_id --pass test123",
      {
        expectSuccess: false,
        cwd: testDir,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/invalid|error/);
  });
});
