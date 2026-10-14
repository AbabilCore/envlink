import { catchAsync, renderWithLayout } from "@/helpers";
import { getDoc } from "./service";
import * as statsService from "@/apis/stats/service";

export const renderIndex = catchAsync(async (req, res) => {
  const { content, toc } = await getDoc("README.md");
  const stats = await statsService.getStats();

  renderWithLayout(res.app, res, "pages/index", {
    title:
      "EnvLink - Secure Environment File Sharing CLI | Anonymous .env Sharing",
    description:
      "Secure and anonymous CLI tool for sharing .env files with password protection and auto-expiration. Zero-knowledge encryption, no signup required. Share environment variables safely across teams.",
    canonicalPath: "/",
    page: "home",
    content,
    toc,
    stats,
  });
});

export const renderCommands = catchAsync(async (req, res) => {
  const { content, toc } = await getDoc("commands.md");
  const stats = await statsService.getStats();

  renderWithLayout(res.app, res, "pages/commands", {
    title: "EnvLink CLI Commands Reference | Complete Command Guide",
    description:
      "Complete reference guide for EnvLink CLI commands. Learn how to create, install, update, and manage secure environment file shares with detailed examples and options.",
    canonicalPath: "/commands",
    page: "commands",
    content,
    toc,
    stats,
  });
});

export const renderFaq = catchAsync(async (req, res) => {
  const { content, toc } = await getDoc("faq.md");
  const stats = await statsService.getStats();

  renderWithLayout(res.app, res, "pages/faq", {
    title: "EnvLink FAQ | Security, Expiration & Usage Questions Answered",
    description:
      "Get answers to frequently asked questions about EnvLink security, expiration policies, file limits, and usage. Learn about zero-knowledge encryption and password protection.",
    canonicalPath: "/faq",
    page: "faq",
    content,
    toc,
    stats,
  });
});

export const renderChangelog = catchAsync(async (req, res) => {
  const { content, toc } = await getDoc("changelog.md");
  const stats = await statsService.getStats();

  renderWithLayout(res.app, res, "pages/changelog", {
    title: "EnvLink Changelog | Release History & Updates",
    description:
      "Complete changelog and release history for EnvLink CLI. Track new features, security improvements, and bug fixes across all versions.",
    canonicalPath: "/changelog",
    page: "changelog",
    content,
    toc,
    stats,
  });
});

export const renderWorkflowIndex = catchAsync(async (req, res) => {
  const stats = await statsService.getStats();

  renderWithLayout(res.app, res, "pages/workflows/index", {
    title:
      "EnvLink Workflows | Encryption & Zero-Knowledge Proof Flow Diagrams",
    description:
      "Technical workflow diagrams showing EnvLink's encryption flow and zero-knowledge proof authentication process. Understand how secure environment file sharing works.",
    canonicalPath: "/workflow",
    page: "workflow",
    stats,
  });
});

export const renderEncryptionFlow = catchAsync(async (req, res) => {
  const { content, toc } = await getDoc("encryption-flow.md");
  const stats = await statsService.getStats();

  renderWithLayout(res.app, res, "pages/workflows/encryption-flow", {
    title: "EnvLink Encryption Flow | AES-256-GCM Technical Diagram",
    description:
      "Technical diagram showing EnvLink's encryption workflow using AES-256-GCM encryption, PBKDF2 key derivation, and secure file sharing process.",
    canonicalPath: "/workflow/encryption-flow",
    page: "workflow",
    content,
    toc,
  });
});

export const renderAuthenticationFlow = catchAsync(async (req, res) => {
  const { content, toc } = await getDoc("authentication-flow.md");
  const stats = await statsService.getStats();

  renderWithLayout(res.app, res, "pages/workflows/authentication-flow", {
    title: "EnvLink Zero-Knowledge Proof Flow | ZKP Authentication Diagram",
    description:
      "Technical diagram showing EnvLink's zero-knowledge proof authentication process. Understand how passwords are verified without being stored.",
    canonicalPath: "/workflow/authentication-flow",
    page: "workflow",
    content,
    toc,
    stats,
  });
});

export const renderSelfHost = catchAsync(async (req, res) => {
  const { content, toc } = await getDoc("self-host.md");
  const stats = await statsService.getStats();

  renderWithLayout(res.app, res, "pages/self-host", {
    title: "Self-Host EnvLink | Complete Setup & Deployment Guide",
    description:
      "Complete guide to self-hosting EnvLink server. Learn how to deploy on VPS, cloud platforms, configure MongoDB, and publish your custom CLI package.",
    canonicalPath: "/self-host",
    page: "self-host",
    content,
    toc,
    stats,
  });
});
