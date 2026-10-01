import { InkSnippet } from "./InkSnippet";
import { ScrollSequence } from "./ScrollSequence";
import styles from "./Practice.module.css";

const SLIPS: { topic: string; text: string; slip: [string, number]; seed: number }[] = [
  { topic: "Integration by parts", text: "e^x(x^2 − 2x − 2)", slip: ["−", 1], seed: 5 },
  { topic: "Simplifying", text: "3 − (x − 4) = 3 − x − 4", slip: ["−", 3], seed: 9 },
  { topic: "Expanding brackets", text: "−2(3x − 1) = −6x − 2", slip: ["−", 3], seed: 14 },
];

const PRACTICE = [
  { level: "Warm-up", prompt: <>Expand −(x − 4)</> },
  { level: "Same idea, new numbers", prompt: <>Expand −3(2x − 5)</> },
  {
    level: "Inside a new integral",
    prompt: (
      <>
        Expand −2(−x cos x + sin x) <span className={styles.from}>from ∫ x<sup>2</sup> cos x dx</span>
      </>
    ),
  },
];

function Arrow() {
  return (
    <svg className={styles.arrow} viewBox="0 0 40 16" aria-hidden="true" data-reveal="draw">
      <path d="M2 8h34M30 2l6 6-6 6" />
    </svg>
  );
}

export function PracticeSection() {
  return (
    <section id="practice" className={`section ${styles.section}`} aria-labelledby="practice-title">
      <div className="container">
        <div className="section-head">
          <h2 id="practice-title" className="section-title">
            The workspace that learns how you think.
          </h2>
          <p className="section-lede">
            Every correction says something about how you work. When the same slip shows up in different problems,
            Learning Workspace connects them and builds practice around the idea underneath.
          </p>
        </div>

        <figure className={styles.board}>
          <figcaption className="visually-hidden">
            An illustrative example: the same sign slip appears in three different problems, Learning Workspace names the
            pattern, and three practice questions target it.
          </figcaption>
          <p className={styles.exampleTag} aria-hidden="true">
            Illustrative example
          </p>

          <ScrollSequence className={styles.columns}>
            <div className={styles.column}>
              <h3 className={styles.columnTitle} data-reveal="">
                Spotted across your work
              </h3>
              <ul className={styles.slips}>
                {SLIPS.map((item) => (
                  <li key={item.topic} className={styles.slip} data-reveal="">
                    <span className={styles.topic}>{item.topic}</span>
                    <InkSnippet text={item.text} slip={item.slip} seed={item.seed} className={styles.ink} />
                  </li>
                ))}
              </ul>
            </div>

            <Arrow />

            <div className={`${styles.column} ${styles.pattern}`} data-reveal="fill">
              <h3 className={styles.columnTitle}>The pattern</h3>
              <p className={styles.patternName}>Distributing a negative sign</p>
              <p className={styles.patternBody}>
                Three different problems, one idea: a negative times a negative was left negative.
              </p>
            </div>

            <Arrow />

            <div className={styles.column}>
              <h3 className={styles.columnTitle} data-reveal="">
                Practice built for it
              </h3>
              <ol className={styles.practice}>
                {PRACTICE.map((item, i) => (
                  <li key={item.level} data-reveal="">
                    <span className={styles.practiceNo}>{i + 1}</span>
                    <span className={styles.practiceText}>
                      <span className={styles.level}>{item.level}</span>
                      <span className={`${styles.prompt} math`}>{item.prompt}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </ScrollSequence>
        </figure>

        <p className={styles.contrast}>
          A question bank gives you more of everything. Targeted practice gives you more of the one step you keep
          missing.
        </p>
      </div>
    </section>
  );
}
