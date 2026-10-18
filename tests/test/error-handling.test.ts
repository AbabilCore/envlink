import { describe, it, expect } from "vitest";
import * as helpers from "@/helpers";

describe("Error Handling", () => {
  describe("Invalid EnvLink ID Format", () => {
    it("should reject invalid ID format in info command", async () => {
      const result = await helpers.executeCLI(
        "info invalid_format --pass test123",
        {
          expectSuccess: false,
        },
      );

      expect(result.success).toBe(true);
      expect(result.output.toLowerCase()).toMatch(/invalid|error/);
    });

    it("should reject invalid ID format in install command", async () => {
      const result = await helpers.executeCLI(
        "install bad-id-format --pass test123",
        {
          expectSuccess: false,
        },
      );

      expect(result.success).toBe(true);
      expect(result.output.toLowerCase()).toMatch(/invalid|error/);
    });

    it("should reject invalid ID format in expire command", async () => {
      const result = await helpers.executeCLI(
        "expire wrong_format --pass test123",
        {
          expectSuccess: false,
        },
      );

      expect(result.success).toBe(true);
      expect(result.output.toLowerCase()).toMatch(/invalid|error/);
    });
  });

  describe("Non-Existent EnvLink", () => {
    it("should handle non-existent EnvLink in info command", async () => {
      const result = await helpers.executeCLI(
        "info el_0000000000000000 --pass test123",
        {
          expectSuccess: false,
        },
      );

      expect(result.success).toBe(true);
      expect(result.output.toLowerCase()).toMatch(/not found|expired|invalid/);
    });

    it("should handle non-existent EnvLink in install command", async () => {
      const result = await helpers.executeCLI(
        "install el_0000000000000000 --pass test123",
        {
          expectSuccess: false,
        },
      );

      expect(result.success).toBe(true);
      expect(result.output.toLowerCase()).toMatch(/not found|expired|invalid/);
    });
  });

  describe("Authentication Errors", () => {
    it("should handle missing password for password-protected EnvLink", async () => {
      const result = await helpers.executeCLI("info el_1234567890abcdef", {
        expectSuccess: false,
      });

      expect(result.success).toBe(true);
      expect(result.output.toLowerCase()).toMatch(/password|required|error/);
    });

    it("should handle wrong password", async () => {
      const result = await helpers.executeCLI(
        "info el_1234567890abcdef --pass wrongpass",
        {
          expectSuccess: false,
        },
      );

      expect(result.success).toBe(true);
      expect(result.output.toLowerCase()).toMatch(/invalid|password|not found/);
    });
  });

  describe("Missing Required Options", () => {
    it("should require --current-pass for update command", async () => {
      const result = await helpers.executeCLI(
        "update el_1234567890abcdef --exp 3d",
        {
          expectSuccess: false,
        },
      );

      expect(result.success).toBe(true);
      expect(result.output.toLowerCase()).toMatch(/required|current-pass/);
    });

    it("should require at least one update option", async () => {
      const result = await helpers.executeCLI(
        "update el_1234567890abcdef --current-pass test123",
        {
          expectSuccess: false,
          input: "y\n",
        },
      );

      expect(result.success).toBe(true);
    });
  });

  describe("Unsupported Operations", () => {
    it("should reject update on optional-password EnvLink", async () => {
      const result = await helpers.executeCLI(
        "update el_12345678901234567890123456789012 --exp 2d --current-pass test123",
        {
          expectSuccess: false,
        },
      );

      expect(result.success).toBe(true);
      expect(result.output.toLowerCase()).toMatch(
        /not supported|optional|error|invalid/,
      );
    });
  });

  describe("Command Validation", () => {
    it("should handle unknown command", async () => {
      const result = await helpers.executeCLI("unknown-command", {
        expectSuccess: false,
      });

      expect(result.success).toBe(true);
      expect(result.output.toLowerCase()).toMatch(/invalid|unknown|help/);
    });

    it("should handle empty command", async () => {
      const result = await helpers.executeCLI("", {
        expectSuccess: false,
      });

      expect(result.success).toBe(true);
      expect(result.output.toLowerCase()).toMatch(/no command|help/);
    });
  });

  describe("Expired EnvLink Access", () => {
    it("should handle expired EnvLink in info command", async () => {
      const result = await helpers.executeCLI(
        "info el_expiredlink0000 --pass test123",
        {
          expectSuccess: false,
        },
      );

      expect(result.success).toBe(true);
      expect(result.output.toLowerCase()).toMatch(/expired|not found|invalid/);
    });

    it("should handle expired EnvLink in install command", async () => {
      const result = await helpers.executeCLI(
        "install el_expiredlink0000 --pass test123",
        {
          expectSuccess: false,
        },
      );

      expect(result.success).toBe(true);
      expect(result.output.toLowerCase()).toMatch(/expired|not found|invalid/);
    });
  });
});
