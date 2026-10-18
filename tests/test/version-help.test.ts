import { describe, it, expect } from "vitest";
import * as helpers from "@/helpers";

describe("Version Commands", () => {
  it("should display version with -v flag", async () => {
    const result = await helpers.executeCLI("-v");
    expect(result.success).toBe(true);
    expect(helpers.hasVersionInfo(result.output)).toBe(true);
  });

  it("should display version with -V flag", async () => {
    const result = await helpers.executeCLI("-V");
    expect(result.success).toBe(true);
    expect(helpers.hasVersionInfo(result.output)).toBe(true);
  });

  it("should display version with --version flag", async () => {
    const result = await helpers.executeCLI("--version");
    expect(result.success).toBe(true);
    expect(helpers.hasVersionInfo(result.output)).toBe(true);
  });
});

describe("Help Commands", () => {
  it("should display help with -h flag", async () => {
    const result = await helpers.executeCLI("-h");
    expect(result.success).toBe(true);
    expect(helpers.hasHelpInfo(result.output)).toBe(true);
  });

  it("should display help with --help flag", async () => {
    const result = await helpers.executeCLI("--help");
    expect(result.success).toBe(true);
    expect(helpers.hasHelpInfo(result.output)).toBe(true);
  });

  it("should display create command help", async () => {
    const result = await helpers.executeCLI("create --help");
    expect(result.success).toBe(true);
    expect(helpers.hasHelpInfo(result.output)).toBe(true);
    expect(result.output.toLowerCase()).toContain("create");
  });

  it("should display install command help", async () => {
    const result = await helpers.executeCLI("install --help");
    expect(result.success).toBe(true);
    expect(helpers.hasHelpInfo(result.output)).toBe(true);
    expect(result.output.toLowerCase()).toContain("install");
  });

  it("should display info command help", async () => {
    const result = await helpers.executeCLI("info --help");
    expect(result.success).toBe(true);
    expect(helpers.hasHelpInfo(result.output)).toBe(true);
    expect(result.output.toLowerCase()).toContain("info");
  });

  it("should display update command help", async () => {
    const result = await helpers.executeCLI("update --help");
    expect(result.success).toBe(true);
    expect(helpers.hasHelpInfo(result.output)).toBe(true);
    expect(result.output.toLowerCase()).toContain("update");
  });

  it("should display expire command help", async () => {
    const result = await helpers.executeCLI("expire --help");
    expect(result.success).toBe(true);
    expect(helpers.hasHelpInfo(result.output)).toBe(true);
    expect(result.output.toLowerCase()).toContain("expire");
  });

  it("should display version-check command help", async () => {
    const result = await helpers.executeCLI("version-check --help");
    expect(result.success).toBe(true);
    expect(helpers.hasHelpInfo(result.output)).toBe(true);
  });
});

describe("Error Handling - Invalid Commands", () => {
  it("should handle invalid command", async () => {
    const result = await helpers.executeCLI("invalid-command", {
      expectSuccess: false,
    });
    expect(result.exitCode).not.toBe(0);
    expect(result.output.toLowerCase()).toContain("invalid");
  });

  it("should handle no command provided", async () => {
    const result = await helpers.executeCLI("", { expectSuccess: false });
    expect(result.exitCode).not.toBe(0);
    expect(result.output.toLowerCase()).toMatch(/no command|help/);
  });
});
