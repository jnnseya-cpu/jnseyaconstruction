import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero drawing-grid">
      <div className="container hero__inner">
        <p className="label">Error 404</p>
        <h1>This page has moved — unlike our programmes.</h1>
        <div className="btn-row" style={{ marginTop: 24 }}>
          <Link className="btn" href="/">Go to the home page</Link>
          <Link className="btn btn--ghost" href="/contact">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
