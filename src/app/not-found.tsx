import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/header/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found | Learning Workspace",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className={styles.main}>
        <div className="container">
          <p className={styles.code}>404</p>
          <h1 className={styles.title}>This page isn’t here.</h1>
          <p className={styles.body}>The link may be out of date. Everything about Learning Workspace is on the home page.</p>
          <Link href="/" className="btn btn-primary">
            Back to Learning Workspace
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
