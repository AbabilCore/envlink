import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as helpers from "@/helpers";

describe("Create Command - Optional-Password (Default)", () => {
  beforeEach(() => {
    helpers.createTestEnvFile("OPTIONAL_TEST=value1\nAPI_KEY=secret123");
  });

  afterEach(() => {
    helpers.cleanupTestFiles();
  });

  it("should create optional-password EnvLink by default", async () => {
    const result = await helpers.executeCLI("create", {
      input: "\n\ny\n",
    });

    expect(result.success).toBe(true);
    const envlinkId = helpers.extractExtendedId(result.output);
    expect(envlinkId).toBeTruthy();
    expect(envlinkId?.length).toBe(35);

    if (envlinkId) {
      helpers.trackEnvLink("optional", envlinkId);
    }
  });

  it("should create optional-password EnvLink with expiration", async () => {
    const result = await helpers.executeCLI("create --exp 5d", {
      input: "\n\ny\n",
    });

    expect(result.success).toBe(true);
    const envlinkId = helpers.extractExtendedId(result.output);
    expect(envlinkId).toBeTruthy();

    if (envlinkId) {
      helpers.trackEnvLink("optional", envlinkId);
    }
  });

  it("should reject reference for optional-password EnvLink", async () => {
    const result = await helpers.executeCLI('create --ref "test-reference"', {
      expectSuccess: false,
    });

    expect(result.exitCode).not.toBe(0);
    expect(result.output.toLowerCase()).toContain("not supported");
  });

  it("should handle deprecated --optional-pass flag", async () => {
    const result = await helpers.executeCLI("create --optional-pass", {
      input: "\n\ny\n",
    });

    expect(result.success).toBe(true);
    const envlinkId = helpers.extractExtendedId(result.output);
    expect(envlinkId).toBeTruthy();

    if (envlinkId) {
      helpers.trackEnvLink("optional", envlinkId);
    }
  });
});

describe("Create Command - Password-Protected", () => {
  beforeEach(() => {
    helpers.createTestEnvFile("PASSWORD_TEST=value1\nSECRET=test123");
  });

  afterEach(() => {
    helpers.cleanupTestFiles();
  });

  it("should create password-protected EnvLink with provided password", async () => {
    const result = await helpers.executeCLI("create --pass testpass123", {
      input: "\n\ny\n",
    });

    expect(result.success).toBe(true);
    const envlinkId = helpers.extractEnvLinkId(result.output);
    expect(envlinkId).toBeTruthy();
    expect(envlinkId?.length).toBe(19);

    if (envlinkId) {
      helpers.trackEnvLink("password", envlinkId, "testpass123");
    }
  });

  it("should create password-protected EnvLink with password prompt", async () => {
    const result = await helpers.executeCLI("create --pass", {
      input: "promptpass456\npromptpass456\n\n\ny\n",
      timeout: 20000,
    });

    expect(result.success).toBe(true);
    const envlinkId = helpers.extractEnvLinkId(result.output);
    expect(envlinkId).toBeTruthy();

    if (envlinkId) {
      helpers.trackEnvLink("password", envlinkId, "promptpass456");
    }
  });

  it("should create password-protected EnvLink with expiration", async () => {
    const result = await helpers.executeCLI(
      "create --pass exptest789 --exp 6h",
      {
        input: "\n\ny\n",
      },
    );

    expect(result.success).toBe(true);
    const envlinkId = helpers.extractEnvLinkId(result.output);
    expect(envlinkId).toBeTruthy();

    if (envlinkId) {
      helpers.trackEnvLink("password", envlinkId, "exptest789");
    }
  });

  it("should create password-protected EnvLink with reference", async () => {
    const result = await helpers.executeCLI(
      'create --pass reftest456 --ref "production-api-keys"',
      {
        input: "\n\ny\n",
      },
    );

    expect(result.success).toBe(true);
    const envlinkId = helpers.extractEnvLinkId(result.output);
    expect(envlinkId).toBeTruthy();

    if (envlinkId) {
      helpers.trackEnvLink("password", envlinkId, "reftest456");
    }
  });

  it("should create password-protected EnvLink with all options", async () => {
    const result = await helpers.executeCLI(
      'create --pass alltest000 --exp 2d --ref "test-all-options"',
      {
        input: "\n\ny\n",
      },
    );

    expect(result.success).toBe(true);
    const envlinkId = helpers.extractEnvLinkId(result.output);
    expect(envlinkId).toBeTruthy();

    if (envlinkId) {
      helpers.trackEnvLink("password", envlinkId, "alltest000");
    }
  });
});
