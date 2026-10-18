import { describe, it, expect } from "vitest";
import * as helpers from "@/helpers";

describe("Version Check Command", () => {
  it("should execute version-check command", async () => {
    const result = await helpers.executeCLI("version-check", {
      timeout: 10000,
    });

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(
      /update|version|latest|current|up to date/,
    );
  });

  it("should execute check-update alias", async () => {
    const result = await helpers.executeCLI("check-update", { timeout: 10000 });

    expect(result.success).toBe(true);
    expect(result.output.toLowerCase()).toMatch(
      /update|version|latest|current|up to date/,
    );
  });

  it("should handle version check completion", async () => {
    const result = await helpers.executeCLI("version-check", {
      timeout: 10000,
    });

    const lowerOutput = result.output.toLowerCase();
    const hasVersionInfo =
      lowerOutput.includes("update available") ||
      lowerOutput.includes("up to date") ||
      lowerOutput.includes("latest") ||
      lowerOutput.includes("current");

    expect(hasVersionInfo).toBe(true);
  });
});
