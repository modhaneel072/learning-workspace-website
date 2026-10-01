import { Graph2D } from "./Graph2D";
import { Surface3D } from "./Surface3D";
import styles from "./Graphs.module.css";

export function GraphsSection() {
  return (
    <section id="graphs" className="section" aria-labelledby="graphs-title">
      <div className="container">
        <div className="section-head">
          <h2 id="graphs-title" className="section-title">
            See the shape behind the symbols.
          </h2>
          <p className="section-lede">
            Graph what you have written, or turn it into a surface. The curve from the problem sits exactly on the
            surface wherever y&nbsp;=&nbsp;x, so the 2D and 3D views tell the same story.
          </p>
        </div>

        <div className={styles.figures}>
          <figure className={styles.figure}>
            <figcaption className={styles.caption}>
              <span className={styles.captionTitle}>Graph your work</span>
              <span className="math">
                f(x) = x<sup>2</sup>e<sup>x</sup>
              </span>
            </figcaption>
            <div className={styles.plot}>
              <Graph2D />
            </div>
          </figure>

          <figure className={styles.figure}>
            <figcaption className={styles.caption}>
              <span className={styles.captionTitle}>Explore it in 3D</span>
              <span className="math">
                z = x<sup>2</sup>e<sup>y</sup>
              </span>
            </figcaption>
            <div className={styles.plot}>
              <Surface3D />
            </div>
          </figure>
        </div>

        <div className={styles.notes}>
          <p className={styles.note}>
            <span className={styles.swatch} aria-hidden="true" />
            <span>
              <strong>The y = x slice.</strong> Set y = x in z = x<sup>2</sup>e<sup>y</sup> and you get x<sup>2</sup>
              e<sup>x</sup>, the same curve as on the left.
            </span>
          </p>
          <p className={styles.note}>
            <span className={`${styles.swatch} ${styles.swatchArea}`} aria-hidden="true" />
            <span>
              <strong>The shaded area is e − 2 ≈ 0.718,</strong> straight from the corrected answer. The sign slip
              would have given 2 − 3e ≈ −6.15: a negative area under a curve that never dips below zero.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
