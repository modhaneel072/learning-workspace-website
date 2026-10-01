import { HeroCanvas } from "./HeroCanvas";
import { WatchDemoLink } from "./WatchDemoLink";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className="container">
        <div className={styles.intro}>
          <h1 id="hero-title" className={styles.title}>
            <span>Learn from your mistakes.</span> <span>While you work.</span>
          </h1>
          <div className={styles.side}>
            <p className={styles.lede}>
              Learning Workspace follows your handwritten math step by step. When your reasoning slips, it points to
              the exact spot and asks the question that helps you fix it yourself.
            </p>
            <div className={styles.actions}>
              <WatchDemoLink className="btn btn-primary">
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M3 1.8v10.4a.6.6 0 00.9.5l8.4-5.2a.6.6 0 000-1L3.9 1.3a.6.6 0 00-.9.5z" fill="currentColor" />
                </svg>
                Watch the demo
              </WatchDemoLink>
              <a href="#early-access" className="btn btn-secondary">
                Get early access
              </a>
            </div>
          </div>
        </div>

        <div className={styles.stage}>
          <div className={styles.device}>
            <div className={styles.screen}>
              <HeroCanvas />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
