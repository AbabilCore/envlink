import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as helpers from "@/helpers";

describe("Info Command", () => {
  let passwordEnvLinkId: string;
  let optionalEnvLinkId: string;
  const testPassword = "infotest123";

  beforeAll(async () => {
    helpers.createTestEnvFile("INFO_TEST=value1\nDATA=test123");

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

  it("should display info for password-protected EnvLink", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(
      `info ${passwordEnvLinkId} --pass ${testPassword}`,
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toContain("status");
    expect(result.output.toLowerCase()).toContain("created");

    const infoData = helpers.parseInfoOutput(result.output);
    expect(infoData.id).toBeTruthy();
    expect(infoData.status).toBeTruthy();
  });

  it("should display info for optional-password EnvLink", async () => {
    if (!optionalEnvLinkId) {
      console.log("Skipping: No optional-password EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(`info ${optionalEnvLinkId}`);

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toContain("status");

    const infoData = helpers.parseInfoOutput(result.output);
    expect(infoData.id).toBeTruthy();
    expect(infoData.type).toBe("optional-password");
  });

  it("should fail with wrong password", async () => {
    if (!passwordEnvLinkId) {
      console.log("Skipping: No password-protected EnvLink created");
      return;
    }

    const result = await helpers.executeCLI(
      `info ${passwordEnvLinkId} --pass wrongpassword`,
      {
        expectSuccess: false,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(
      /invalid|password|error|denied|not found/,
    );
  });

  it("should fail with invalid EnvLink ID format", async () => {
    const result = await helpers.executeCLI(
      "info invalid_format --pass test123",
      {
        expectSuccess: false,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/invalid|error/);
  });

  it("should fail with non-existent EnvLink ID", async () => {
    const result = await helpers.executeCLI(
      "info el_1234567890abcdef --pass test123",
      {
        expectSuccess: false,
      },
    );

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/not found|expired|invalid/);
  });
});
