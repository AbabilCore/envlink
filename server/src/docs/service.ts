import hljs from "highlight.js";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const renderMarkdown = async (
  markdown: string,
): Promise<{ html: string; toc: TocItem[] }> => {
  const { marked } = await import("marked");
  const toc: TocItem[] = [];

  const renderer = new marked.Renderer();

  renderer.heading = ({ text, depth }) => {
    const cleanText = text.replace(/<[^>]*>/g, "");
    const id = cleanText
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    if (depth === 2 || depth === 3) {
      toc.push({ id, text: cleanText, level: depth });
    }

    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };

  renderer.code = ({ text, lang }) => {
    if (lang === "mermaid") {
      return `<pre class="mermaid">${text}</pre>`;
    }
    const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
    const highlighted = hljs.highlight(text, { language }).value;
    return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
  };

  marked.use({
    renderer,
    gfm: true,
  });

  const html = marked.parse(markdown) as string;

  return { html, toc };
};

const fetchLocalDoc = async (fileName: string): Promise<string> => {
  const fs = await import("fs/promises");
  const path = await import("path");

  const contentFiles = [
    "authentication-flow.md",
    "encryption-flow.md",
    "changelog.md",
  ];

  const buildDocsPath = path.join(process.cwd(), "build", "docs");

  let docPath: string;

  if (contentFiles.includes(fileName)) {
    docPath = path.join(buildDocsPath, "content", fileName);
  } else {
    docPath = path.join(buildDocsPath, fileName);
  }

  try {
    return await fs.readFile(docPath, "utf-8");
  } catch (err: any) {
    if (err.code === "ENOENT") {
      throw new Error(`Doc not found: ${fileName} (tried ${docPath})`);
    }
    throw err;
  }
};

export const getDoc = async (
  fileName: string,
): Promise<{
  content: string;
  toc: Array<{ id: string; text: string; level: number }>;
}> => {
  const markdown = await fetchLocalDoc(fileName);
  const { html, toc } = await renderMarkdown(markdown);

  return {
    content: html,
    toc,
  };
};
