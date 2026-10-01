import { SiteHeader } from "@/components/header/SiteHeader";
import { Hero } from "@/components/hero/Hero";
import { DemoFilm } from "@/components/film/DemoFilm";
import { LearningStory } from "@/components/story/LearningStory";
import { PracticeSection } from "@/components/practice/PracticeSection";
import { GraphsSection } from "@/components/graphs/GraphsSection";
import { Closing } from "@/components/closing/Closing";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <div id="top" />
        <Hero />
        <DemoFilm />
        <LearningStory />
        <PracticeSection />
        <GraphsSection />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
