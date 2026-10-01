"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import styles from "./Closing.module.css";

type Status = "idle" | "sending" | "sent" | "not-configured" | "error";

/**
 * Public form endpoint (e.g. a Formspree form URL) set at build time. The site is
 * static, so the browser posts to it directly; it must accept JSON and allow CORS.
 * Unset means sign-up is not connected: nothing is sent or stored.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_EARLY_ACCESS_ENDPOINT || "";
const CONFIGURED = ENDPOINT !== "";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// false in the static HTML, true once React runs. Until then the button stays
// disabled, so the browser can never submit the form natively (which would put
// the email in the page URL).
const noopSubscribe = () => () => {};

const ROLES = [
  { value: "", label: "Prefer not to say" },
  { value: "high-school", label: "High-school student" },
  { value: "university", label: "University student" },
  { value: "educator", label: "Teacher or tutor" },
  { value: "parent", label: "Parent" },
  { value: "other", label: "Something else" },
];

export function EarlyAccessForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const interactive = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();

    if (!email) {
      setError("Enter your email address.");
      emailRef.current?.focus();
      return;
    }
    if (email.length > 254 || !EMAIL.test(email)) {
      setError("Enter an email address like name@example.com.");
      emailRef.current?.focus();
      return;
    }
    setError(null);

    if (!CONFIGURED) {
      setStatus("not-configured");
      return;
    }
    // Honeypot: people never see this field, so a filled one means an automated submission.
    if (String(data.get("company") ?? "").trim() !== "") return;

    setStatus("sending");
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email,
          role: String(data.get("role") ?? "") || null,
          source: "learning-workspace-website",
        }),
      });
      if (response.ok) {
        setStatus("sent");
        form.reset();
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className={styles.form} noValidate onSubmit={onSubmit} aria-describedby="early-access-note">
      <div className={styles.field}>
        <label htmlFor="ea-email">Email</label>
        <input
          ref={emailRef}
          id="ea-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "ea-email-error" : undefined}
          onChange={() => {
            if (error) setError(null);
            if (status !== "idle" && status !== "sending") setStatus("idle");
          }}
        />
        {error ? (
          <p id="ea-email-error" className={styles.fieldError}>
            {error}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="ea-role">
          I am a… <span className={styles.optional}>(optional)</span>
        </label>
        <select id="ea-role" name="role" defaultValue="">
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="ea-company">Company</label>
        <input id="ea-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={!interactive || status === "sending"}>
        {status === "sending" ? "Sending…" : "Request early access"}
      </button>

      <div className={styles.status} aria-live="polite" role="status">
        {status === "sent" ? <p className={styles.ok}>Request received. You are on the early-access list.</p> : null}
        {status === "not-configured" ? (
          <p className={styles.warn}>
            Not sent. Early-access sign-up is not connected yet, so your email was not sent or stored anywhere.
          </p>
        ) : null}
        {status === "error" ? (
          <p className={styles.errorText}>Your request could not be sent right now. Please try again in a few minutes.</p>
        ) : null}
      </div>

      <noscript>
        <p className={styles.note}>Requesting early access needs JavaScript. Turn it on and reload the page.</p>
      </noscript>

      <p id="early-access-note" className={styles.note}>
        {CONFIGURED
          ? "Your email goes to the Learning Workspace team for early-access updates."
          : "Sign-up is not connected yet. Nothing you enter here is sent or stored."}
      </p>
    </form>
  );
}
