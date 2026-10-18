import * as interfaces from "@/interface";

export function extractEnvLinkId(output: string): string | null {
  const match = output.match(/\b(el_[0-9A-Za-z]{16})\b/);
  return match?.[1] ?? null;
}

export function extractExtendedId(output: string): string | null {
  const match = output.match(/\b(el_[0-9A-Za-z]{32})\b/);
  return match?.[1] ?? null;
}

export function parseInfoOutput(output: string): interfaces.InfoData {
  const data: interfaces.InfoData = {};

  const idMatch = output.match(/ID[:\s]+([^\s\n]+)/i);
  if (idMatch?.[1]) data.id = idMatch[1];

  const statusMatch = output.match(/Status[:\s]+([^\s\n]+)/i);
  if (statusMatch?.[1]) data.status = statusMatch[1];

  const filesMatch = output.match(/Files[:\s]+(\d+)/i);
  if (filesMatch?.[1]) data.filesCount = Number.parseInt(filesMatch[1], 10);

  const installMatch = output.match(/Install(?:s|ed)?[:\s]+(\d+)/i);
  if (installMatch?.[1])
    data.installCount = Number.parseInt(installMatch[1], 10);

  const createdMatch = output.match(/Created[:\s]+([^\n]+)/i);
  if (createdMatch?.[1]) data.createdAt = createdMatch[1].trim();

  const expiresMatch = output.match(/Expires[:\s]+([^\n]+)/i);
  if (expiresMatch?.[1]) data.expiresAt = expiresMatch[1].trim();

  const refMatch = output.match(/Reference[:\s]+([^\n]+)/i);
  if (refMatch?.[1]) data.reference = refMatch[1].trim();

  if (output.toLowerCase().includes("optional-password")) {
    data.type = "optional-password";
  } else if (output.toLowerCase().includes("password")) {
    data.type = "password";
  }

  return data;
}

export function parseErrorMessage(output: string): string {
  const errorMatch = output.match(/error[:\s]+(.+)/i);
  if (errorMatch?.[1]) return errorMatch[1].trim();

  const symbolMatch = output.match(/[\u2717\u2718]\s+(.+)/);
  if (symbolMatch?.[1]) return symbolMatch[1].trim();

  const lines = output.split("\n").filter((line) => line.trim());
  return lines[0] ?? output;
}

export function hasVersionInfo(output: string): boolean {
  return /\d+\.\d+\.\d+/.test(output);
}

export function hasHelpInfo(output: string): boolean {
  const helpKeywords = ["usage:", "options:", "commands:", "description:"];
  const lowerOutput = output.toLowerCase();
  return helpKeywords.some((keyword) => lowerOutput.includes(keyword));
}
