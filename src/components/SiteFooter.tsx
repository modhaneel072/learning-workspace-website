import { NAV_LINKS, SITE_NAME } from "@/lib/site";
import { LogoMark } from "./header/LogoMark";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandBlock}>
          <a href="#top" className={styles.brand}>
            <LogoMark size={24} />
            <span translate="no">{SITE_NAME}</span>
          </a>
          <p className={styles.tagline}>The workspace that learns how you think.</p>
        </div>
        <nav aria-label="Footer">
          <ul className={styles.links}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
            <li>
              <a href="#early-access">Early access</a>
            </li>
          </ul>
        </nav>
        <p className={styles.legal}>© {new Date().getFullYear()} {SITE_NAME}</p>
      </div>
    </footer>
  );
}
