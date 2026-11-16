// One-click actions for the connect page: a link that opens the client's own
// install or settings screen, or a button that copies the address or command.
export const ConnectLink = ({ href, children }) => (
  <a className="cn-connect" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
    {children}
  </a>
);

export const CopyButton = ({ text, children }) => {
  const [state, setState] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("Copied");
      setTimeout(() => setState(""), 2000);
    } catch {
      // No clipboard access: show the text selected so the reader can copy it.
      window.prompt("Copy this:", text);
    }
  };
  return (
    <button type="button" className="cn-connect" onClick={copy}>
      <span aria-live="polite">{state || children}</span>
    </button>
  );
};
