const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
const mode = args[0] || "build";

const outdir = path.join(__dirname, "../build");

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8"),
);
const external = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
];

function copyPublicFolder() {
  const publicSrc = path.join(__dirname, "../public");
  const publicDest = path.join(outdir, "public");

  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true });
    console.log("✓ Public folder copied to build/public");
  }
}

function copyViewsFolder() {
  const viewsSrc = path.join(__dirname, "../src/docs/views");
  const viewsDest = path.join(outdir, "docs/views");

  if (fs.existsSync(viewsSrc)) {
    fs.cpSync(viewsSrc, viewsDest, { recursive: true });
    console.log("✓ Views folder copied to build/docs/views");
  }
}

function copyContentFolder() {
  const contentSrc = path.join(__dirname, "../src/docs/content");
  const contentDest = path.join(outdir, "docs/content");

  if (fs.existsSync(contentSrc)) {
    fs.cpSync(contentSrc, contentDest, { recursive: true });
    console.log("✓ Content folder copied to build/docs/content");
  }
}

function copyMarkdownDocs() {
  const envlinkRoot = path.join(__dirname, "../../");
  const docsDest = path.join(outdir, "docs");

  fs.mkdirSync(docsDest, { recursive: true });

  const markdownFiles = ["README.md", "commands.md", "faq.md", "self-host.md"];

  markdownFiles.forEach((file) => {
    const srcPath = path.join(envlinkRoot, file);
    const destPath = path.join(docsDest, file);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  });

  console.log("✓ Markdown docs copied to build/docs/");
}

function syncFiles() {
  fs.mkdirSync(outdir, { recursive: true });
  copyPublicFolder();
  copyViewsFolder();
  copyContentFolder();
  copyMarkdownDocs();
  console.log("✓ Files synced to build/");
}

function cleanBuild() {
  if (fs.existsSync(outdir)) {
    fs.rmSync(outdir, { recursive: true, force: true });
    console.log("✓ build/ folder cleaned");
  }
}

async function build() {
  try {
    if (fs.existsSync(outdir)) {
      fs.rmSync(outdir, { recursive: true, force: true });
    }
    fs.mkdirSync(outdir, { recursive: true });

    const result = await Bun.build({
      entrypoints: ["./src/server.ts"],
      outdir: "./build",
      target: "node",
      format: "cjs",
      sourcemap: "external",
      minify: false,
      external,
    });

    if (!result.success) {
      console.error("Build failed:");
      result.logs.forEach((log) => console.error(log));
      process.exit(1);
    }

    copyPublicFolder();
    copyViewsFolder();
    copyContentFolder();
    copyMarkdownDocs();

    const size = (fs.statSync("./build/server.js").size / 1024).toFixed(2);
    console.log(`Bundle size: ${size} KB`);
    console.log(`External dependencies: ${external.length}`);
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

async function main() {
  switch (mode) {
    case "build":
      await build();
      break;
    case "sync":
      syncFiles();
      break;
    case "clean":
      cleanBuild();
      break;
    default:
      console.error(`Unknown mode: ${mode}`);
      console.log("Usage: node setup.js [build|sync|clean]");
      process.exit(1);
  }
}

main();
