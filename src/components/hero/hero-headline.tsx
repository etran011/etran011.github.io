import { Fragment, type CSSProperties } from "react";

const lines = [
  { words: ["Building", "intelligent", "systems,"], offset: 0 },
  { words: ["one", "idea", "at", "a", "time."], offset: 3 },
];

/** Real text, enhanced with one-time CSS animation rather than a JS text loop. */
export function HeroHeadline() {
  return (
    <p className="hero-headline">
      {lines.map(({ words, offset }) => (
        <span className="hero-headline-line" key={offset}>
          {words.map((word, index) => <Fragment key={word}><span className="hero-word" style={{ "--word-index": offset + index } as CSSProperties}>{word}</span>{index < words.length - 1 ? " " : null}</Fragment>)}{offset === 0 ? " " : null}
        </span>
      ))}
    </p>
  );
}
