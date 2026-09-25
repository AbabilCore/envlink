import fs from "fs";

export function discoverEnvFiles(cwd: string = process.cwd()): string[] {
  try {
    const files = fs.readdirSync(cwd);

    const envFiles = files.filter((file) => {
      return /^\.env(\.[a-zA-Z0-9_-]+)?$/.test(file);
    });

    return envFiles.sort();
  } catch (error) {
    return [];
  }
}

export function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    throw new Error(`Failed to read file: ${filePath}`);
  }
}

export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

export function writeFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, "utf8");
}
