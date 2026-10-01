import { InteractivePreview } from "./InteractivePreview";

export function LearningStory() {
  return (
    <section id="how-it-works" className="section" aria-labelledby="story-title">
      <div className="container">
        <div className="section-head">
          <h2 id="story-title" className="section-title">
            Guidance beside your work, not instead of it.
          </h2>
          <p className="section-lede">
            Learning Workspace reads each step as you write it. When one goes wrong, you get a question at that spot,
            so the fix and the understanding stay yours.
          </p>
        </div>
        <InteractivePreview />
      </div>
    </section>
  );
}
