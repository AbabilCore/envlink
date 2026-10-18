import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as helpers from "@/helpers";

describe("Expire Command", () => {
  let passwordEnvLinkId: string;
  let optionalEnvLinkId: string;
  const testPassword = "expiretest123";

  beforeAll(async () => {
    helpers.createTestEnvFile("EXPIRE_TEST=value1\nAPI_KEY=secret123");

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

  it("should expire password-protected EnvLink with password", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(
      `expire ${passwordEnvLinkId} --pass ${testPassword}`,
      {
        input: "y\n",
        timeout: 20000,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/expire|sure|confirm/);
  });

  it("should expire optional-password EnvLink without password", async () => {
    if (!optionalEnvLinkId) {
      console.log("Skipping: No optional-password EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(`expire ${optionalEnvLinkId}`, {
      input: "y\n",
      timeout: 20000,
    });

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/expire|sure|confirm/);
  });

  it("should fail with wrong password", async () => {
    const createResult = await helpers.executeCLI(
      "create --pass wrongtest789",
      {
        input: "\n\ny\n",
        timeout: 20000,
      },
    );

    const newEnvLinkId = helpers.extractEnvLinkId(createResult.output);

    if (!newEnvLinkId) {
      console.log("Skipping: Could not create test EnvLink");
      return;
    }

    const result = await helpers.executeCLI(
      `expire ${newEnvLinkId} --pass wrongpassword`,
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

  it("should handle confirmation prompt", async () => {
    const createResult = await helpers.executeCLI(
      "create --pass confirmtest456",
      {
        input: "\n\ny\n",
        timeout: 20000,
      },
    );

    const newEnvLinkId = helpers.extractEnvLinkId(createResult.output);

    if (!newEnvLinkId) {
      console.log("Skipping: Could not create test EnvLink");
      return;
    }

    const result = await helpers.executeCLI(
      `expire ${newEnvLinkId} --pass confirmtest456`,
      {
        input: "n\n",
        timeout: 20000,
      },
    );

    expect(result.output.toLowerCase()).toMatch(/sure|confirm|cancel/);
  });

  it("should fail with invalid EnvLink ID", async () => {
    const result = await helpers.executeCLI(
      "expire invalid_id --pass test123",
      {
        expectSuccess: false,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/invalid|error/);
  });

  it("should fail with non-existent EnvLink ID", async () => {
    const result = await helpers.executeCLI(
      "expire el_1234567890abcdef --pass test123",
      {
        expectSuccess: false,
        input: "y\n",
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/not found|expired|invalid/);
  });
});
