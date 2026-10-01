"use client";

import { useEffect, useRef, useState } from "react";
import { NAV_LINKS, SITE_NAME } from "@/lib/site";
import { LogoMark } from "./LogoMark";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 900px)");
    const onChange = () => desktop.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onChange);
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onChange);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={styles.header} data-open={open || undefined}>
      <div className={`container ${styles.bar}`}>
        <a href="#top" className={styles.brand} onClick={close}>
          <LogoMark />
          <span translate="no">{SITE_NAME}</span>
        </a>

        <nav className={styles.nav} aria-label="Main">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <a href="#early-access" className={`btn btn-primary ${styles.cta}`}>
          Get early access
        </a>

        <button
          ref={buttonRef}
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span aria-hidden="true" className={styles.menuIcon} />
        </button>
      </div>

      <div id="mobile-menu" className={styles.panel} hidden={!open}>
        <nav className="container" aria-label="Mobile">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={close}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#early-access" className="btn btn-primary" onClick={close}>
            Get early access
          </a>
        </nav>
      </div>
    </header>
  );
}
