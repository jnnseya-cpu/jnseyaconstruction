"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="section">
      <div className="container">
        <h1>Something went wrong</h1>
        <p>Please try again. If it keeps happening, use the contact page to tell us.</p>
        <button className="btn" type="button" onClick={reset}>Try again</button>
      </div>
    </section>
  );
}
