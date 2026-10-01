import { EarlyAccessForm } from "./EarlyAccessForm";
import styles from "./Closing.module.css";

export function Closing() {
  return (
    <section id="early-access" className={`section ${styles.section}`} aria-labelledby="closing-title">
      <div className="container">
        <h2 id="closing-title" className={styles.title}>
          <span>Don’t just find your mistakes.</span> <span>Stop repeating them.</span>
        </h2>

        <div className={styles.grid}>
          <div className={styles.copy}>
            <p className={styles.lede}>
              Learning Workspace starts with multi-step math for high-school and university students. Request early
              access to be among the first to try it.
            </p>
            <dl className={styles.roadmap}>
              <div>
                <dt>Starting with math</dt>
                <dd>Handwritten, multi-step problems with feedback as you work, targeted practice, and 2D and 3D graphs.</dd>
              </div>
              <div>
                <dt>Later</dt>
                <dd>Programming, engineering, circuits, diagrams and CAD. These are longer-term plans, not available yet.</dd>
              </div>
            </dl>
          </div>

          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>Get early access</h3>
            <EarlyAccessForm />
          </div>
        </div>
      </div>
    </section>
  );
}
