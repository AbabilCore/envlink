import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as helpers from "@/helpers";

describe("Update Command", () => {
  let passwordEnvLinkId: string;
  let optionalEnvLinkId: string;
  const testPassword = "updatetest123";

  beforeAll(async () => {
    helpers.createTestEnvFile("UPDATE_TEST=value1\nAPI_KEY=secret123");

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
  });

  afterAll(() => {
    helpers.cleanupTestFiles();
  });

  it("should update expiration", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(
      `update ${passwordEnvLinkId} --exp 3d --current-pass ${testPassword}`,
      {
        input: "y\n",
        timeout: 20000,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/update|proceed|success/);
  });

  it("should update reference label", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(
      `update ${passwordEnvLinkId} --ref "updated-reference" --current-pass ${testPassword}`,
      {
        input: "y\n",
        timeout: 20000,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/update|proceed|reference/);
  });

  it("should update files", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    helpers.createTestEnvFile("UPDATED_VAR=new_value\nUPDATE_TEST=true");

    const result = await helpers.executeCLI(
      `update ${passwordEnvLinkId} --files --current-pass ${testPassword}`,
      {
        input: "y\n",
        timeout: 20000,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/update|proceed|file/);

    helpers.cleanupTestFiles();
  });

  it("should update with multiple options", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    helpers.createTestEnvFile("MULTI_UPDATE=value\nNEW_VAR=test");

    const result = await helpers.executeCLI(
      `update ${passwordEnvLinkId} --files --exp 7d --ref "multi-update" --current-pass ${testPassword}`,
      {
        input: "y\n",
        timeout: 20000,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/update|proceed/);

    helpers.cleanupTestFiles();
  });

  it("should update password", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(
      `update ${passwordEnvLinkId} --pass newpass456 --current-pass ${testPassword}`,
      {
        input: "y\n",
        timeout: 30000,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/update|proceed|password/);
  });

  it("should fail without --current-pass", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(
      `update ${passwordEnvLinkId} --exp 3d`,
      {
        expectSuccess: false,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/required|current-pass|error/);
  });

  it("should fail for optional-password EnvLink", async () => {
    if (!optionalEnvLinkId) {
      console.log("Skipping: No optional-password EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(
      `update ${optionalEnvLinkId} --exp 2d --current-pass ${testPassword}`,
      {
        expectSuccess: false,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(
      /invalid|not supported|optional|error/,
    );
  });

  it("should fail with wrong current password", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(
      `update ${passwordEnvLinkId} --exp 3d --current-pass wrongpassword`,
      {
        expectSuccess: false,
        input: "y\n",
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(
      /invalid|password|error|denied|not found/,
    );
  });
});
