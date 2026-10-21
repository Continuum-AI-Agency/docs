// Skip link for keyboard users: Tab once, Enter, and focus lands in the page content.
(() => {
  if (document.getElementById("cn-skip")) return;
  const link = Object.assign(document.createElement("a"), { id: "cn-skip", href: "#content-area", textContent: "Skip to content" });
  link.addEventListener("click", (event) => {
    const target = document.getElementById("content-area");
    if (!target) return;
    event.preventDefault();
    target.setAttribute("tabindex", "-1");
    target.focus();
  });
  document.body.prepend(link);
})();
