// Copy page hands an agent this page: its URL, the .md URL, the docs index,
// then the page. Hosted Mintlify fills the body from the .md export. Local
// preview does not serve .md, so the body falls back to the article on screen.
(() => {
  if (window.__cnAgentCopy) return;
  window.__cnAgentCopy = true;

  const clip = navigator.clipboard;
  if (!clip || typeof clip.write !== "function") return;

  let armed = 0;
  const arm = () => {
    armed = performance.now() + 4000;
  };

  const copyName = (node) => {
    const btn = node && node.closest && node.closest("button");
    if (!btn) return "";
    return (btn.getAttribute("aria-label") || btn.textContent || "").replace(/\s+/g, " ").trim();
  };

  document.addEventListener("click", (event) => {
    const name = copyName(event.target);
    if (name === "Copy page" || name === "Copying...") arm();
  }, true);

  document.addEventListener("keydown", (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "c") return;
    const selected = document.getSelection();
    if (selected && selected.toString().trim()) return;
    arm();
  }, true);

  const urls = () => {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    const page = location.origin + (path === "/" ? "/" : path);
    const md = location.origin + (path === "/" ? "/index.md" : `${path}.md`);
    return { page, md, index: `${location.origin}/llms.txt` };
  };

  const abs = (href) => {
    try {
      return new URL(href, location.origin).href;
    } catch {
      return href;
    }
  };

  const inline = (el) => {
    if (!el || el.nodeType === 3) return el ? el.textContent : "";
    if (el.nodeType !== 1) return "";
    const tag = el.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "SVG" || tag === "BUTTON") return "";
    if (tag === "BR") return "\n";
    if (tag === "IMG") return "";
    if (tag === "CODE" && el.parentElement?.tagName !== "PRE") {
      const code = el.textContent.trim();
      return code ? `\`${code}\`` : "";
    }
    const text = [...el.childNodes].map(inline).join("");
    if (tag === "A") {
      const label = text.replace(/\s+/g, " ").trim();
      const href = el.getAttribute("href") || "";
      if (!label || /^navigate to header$/i.test(label) || href.startsWith("#")) return href.startsWith("#") ? "" : label;
      return `[${label}](${abs(href)})`;
    }
    if (tag === "STRONG" || tag === "B") return text.trim() ? `**${text.trim()}**` : "";
    if (tag === "EM" || tag === "I") return text.trim() ? `*${text.trim()}*` : "";
    return text;
  };

  const plain = (el) => inline(el).replace(/[ \t]+\n/g, "\n").replace(/[ \t]{2,}/g, " ").trim();

  const block = (el, lines) => {
    if (!el || el.nodeType !== 1) return;
    // Mintlify hides the real card link and puts role=link on the card. Keep a
    // hidden node when it holds the title or body. Decorative icons stay out.
    if (el.getAttribute("aria-hidden") === "true" && !el.querySelector("h1,h2,h3,h4,h5,h6,p,span")) return;
    const tag = el.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "BUTTON" || tag === "SVG") return;
    if (tag === "PRE") {
      lines.push("", "```", el.textContent.replace(/\n$/, ""), "```", "");
      return;
    }
    if (/^H[1-6]$/.test(tag)) {
      const text = plain(el);
      if (text) lines.push("", `${"#".repeat(Number(tag[1]))} ${text}`, "");
      return;
    }
    if (tag === "P" || tag === "BLOCKQUOTE") {
      const text = plain(el);
      if (text) lines.push("", tag === "BLOCKQUOTE" ? `> ${text}` : text, "");
      return;
    }
    if (tag === "UL" || tag === "OL") {
      lines.push("");
      for (const li of el.children) {
        if (li.tagName !== "LI") continue;
        const text = plain(li);
        if (text) lines.push(`- ${text}`);
      }
      lines.push("");
      return;
    }
    if (tag === "TABLE") {
      const rows = [...el.querySelectorAll("tr")];
      rows.forEach((row, i) => {
        const cells = [...row.children].map((cell) => plain(cell).replace(/\|/g, "\\|"));
        if (!cells.some(Boolean)) return;
        lines.push(`| ${cells.join(" | ")} |`);
        if (i === 0) lines.push(`| ${cells.map(() => "---").join(" | ")} |`);
      });
      lines.push("");
      return;
    }
    if (tag === "A" && el.querySelector("h2, h3, p, span")) {
      for (const child of el.children) block(child, lines);
      const href = el.getAttribute("href");
      if (href && !href.startsWith("#")) lines.push(`(${abs(href)})`, "");
      return;
    }
    if (!el.querySelector("h1,h2,h3,h4,h5,h6,p,ul,ol,table,pre,blockquote")) {
      const text = plain(el);
      if (text) lines.push("", text, "");
      return;
    }
    for (const child of el.children) block(child, lines);
  };

  const pageMarkdown = () => {
    const root = document.querySelector(".mdx-content");
    if (!root) return "";
    const lines = [];
    const title = document.querySelector("h1")?.textContent?.trim();
    if (title) lines.push(`# ${title}`, "");
    const description = document.querySelector('meta[name="description"]')?.getAttribute("content");
    if (description) lines.push(`> ${description}`, "");
    for (const child of root.children) block(child, lines);
    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  };

  const shape = (raw) => {
    const { page, md, index } = urls();
    const head = `Page: ${page}\nMarkdown: ${md}\nSearch the docs: ${index}\n\n`;
    const body = raw && raw.trim() ? raw.replace(/^\uFEFF/, "").trim() : pageMarkdown();
    if (body.startsWith("Page: ")) return body;
    return `${head}${body}\n`;
  };

  const write = clip.write.bind(clip);
  clip.write = async (items) => {
    if (performance.now() > armed) return write(items);
    armed = 0;
    let raw = "";
    for (const item of items) {
      if (![...item.types].includes("text/plain")) continue;
      raw += await (await item.getType("text/plain")).text();
    }
    const next = shape(raw);
    return write([new ClipboardItem({ "text/plain": new Blob([next], { type: "text/plain" }) })]);
  };
})();
