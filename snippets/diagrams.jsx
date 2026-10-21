// Brand diagrams. Styles are the .cn-* rules in style.css; text stays real text.

// A numbered row of steps. `you` highlights the step that needs a person.
export const Flow = ({ steps, you, label }) => (
  <div className="cn-flow" role="list" aria-label={label}>
    {steps.map((step, i) => (
      <div key={step} role="listitem" className={step === you ? "cn-flow__step is-you" : "cn-flow__step"}>
        <span className="cn-flow__idx" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
        <span>{step}</span>
      </div>
    ))}
  </div>
);

// Stacked lanes, each a labelled Flow with an optional note. `tone` is "gate" (accent) or "muted".
// Steps share one column grid across lanes, so short lanes don't stretch.
export const Lanes = ({ lanes }) => (
  <div className="cn-lanes" style={{ "--cn-cols": Math.max(...lanes.map((lane) => lane.steps.length)) }}>
    {lanes.map((lane) => (
      <div key={lane.label} className={lane.tone ? `cn-lane is-${lane.tone}` : "cn-lane"}>
        <div className="cn-lane__label">{lane.label}</div>
        <Flow steps={lane.steps} you={lane.you} label={lane.label} />
        {lane.note && <p className="cn-lane__note">{lane.note}</p>}
      </div>
    ))}
  </div>
);

// The five-station loop from Core concepts. Hidden on narrow screens, where the Steps below it carry the same content.
export const CreativeLoop = () => (
  <figure className="cn-fig cn-fig--wide">
    <svg className="cn-loop" viewBox="0 0 640 320" role="img" aria-labelledby="cn-loop-t cn-loop-d">
      <title id="cn-loop-t">The creative loop</title>
      <desc id="cn-loop-d">Five stations in a loop: Connect, Ground, Create, Publish, Optimize. Results from Optimize write back into the next plan, and the loop starts again.</desc>
      <ellipse className="cn-ring" cx="320" cy="160" rx="236" ry="112" />
      <path className="cn-chev" d="M-5,-6 L4,0 L-5,6" transform="translate(458.7 69.4) rotate(19.0)" />
      <path className="cn-chev" d="M-5,-6 L4,0 L-5,6" transform="translate(544.4 194.6) rotate(124.4)" />
      <path className="cn-chev" d="M-5,-6 L4,0 L-5,6" transform="translate(320.0 272.0) rotate(180.0)" />
      <path className="cn-chev" d="M-5,-6 L4,0 L-5,6" transform="translate(95.6 194.6) rotate(-124.4)" />
      <path className="cn-chev" d="M-5,-6 L4,0 L-5,6" transform="translate(181.3 69.4) rotate(-19.0)" />
      <text className="cn-loop-eyebrow" x="320" y="146" textAnchor="middle">THE CREATIVE LOOP</text>
      <text className="cn-loop-note" x="320" y="172" textAnchor="middle">Results write back</text>
      <text className="cn-loop-note" x="320" y="192" textAnchor="middle">into the next plan.</text>
      {[
        ["01", "Connect", 258.0, 24.0],
        ["02", "Ground", 482.4, 101.4],
        ["03", "Create", 396.7, 226.6],
        ["04", "Publish", 119.3, 226.6],
        ["05", "Optimize", 33.6, 101.4],
      ].map(([idx, name, x, y]) => (
        <g key={idx} transform={`translate(${x} ${y})`}>
          <rect className="cn-node" width="124" height="48" rx="8" />
          <text className="cn-idx" x="14" y="29">{idx}</text>
          <text className="cn-name" x="38" y="30">{name}</text>
        </g>
      ))}
    </svg>
  </figure>
);
