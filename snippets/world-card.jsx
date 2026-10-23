// A product-line card whose plate is in the first HTML response: lazy, low
// priority, and sized so it doesn't compete with the first paint. dither.js
// plays the app's glyph reveal when the plate actually loads in.
// The plate sits outside Mintlify's Card, whose link is display:contents and
// only wraps the text, so this anchor is the one hit target.
export const WorldCard = ({ img, href, children }) => (
  <a className="cn-world" href={href}>
    <img
      className="cn-world-img"
      src={img}
      alt=""
      width="640"
      height="357"
      loading="lazy"
      decoding="async"
      fetchpriority="low"
      sizes="(min-width: 640px) 30vw, 100vw"
    />
    {children}
  </a>
);
