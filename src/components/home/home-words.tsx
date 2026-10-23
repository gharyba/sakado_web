import { Fragment } from "react";
import styles from "./home-words.module.css";

/** Visible server text; the parent heading supplies its accessible name. */
export function HomeWords({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  return (
    <span data-home-words>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span className={styles.word} data-home-word aria-hidden="true">
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
