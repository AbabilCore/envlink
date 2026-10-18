import fs from "node:fs";
import path from "node:path";
import * as CONST from "@/constants";
import * as interfaces from "@/interface";

const trackedEnvLinks: interfaces.TrackedEnvLink[] = [];

export function trackEnvLink(
  type: "password" | "optional",
  id: string,
  password?: string,
): void {
  trackedEnvLinks.push({ type, id, password });
}

export function getAllTrackedEnvLinks(): interfaces.TrackedEnvLink[] {
  return [...trackedEnvLinks];
}

export function clearTrackedEnvLinks(): void {
  trackedEnvLinks.length = 0;
}

export function createTestEnvFile(
  content: string = "TEST_VAR=test_value\nAPI_KEY=secret123\nDB_URL=localhost:5432",
  filename: string = ".env",
): string {
  const filePath = path.join(CONST.BASE_DIR, filename);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

export function cleanupTestFiles(files: string[] = [".env"]): void {
  const defaultFiles = [".env", ".env.local", ".env.production", ".env.test"];
  const allFiles = [...new Set([...files, ...defaultFiles])];

  for (const file of allFiles) {
    const filePath = path.join(CONST.BASE_DIR, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

export function ensureTestDirectory(dirPath: string): string {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

export function removeTestDirectory(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}
