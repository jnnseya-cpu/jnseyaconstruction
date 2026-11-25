import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero drawing-grid">
      <div className="container hero__inner">
        <p className="label">Error 404</p>
        <h1>We cannot find that page</h1>
        <p className="lede">It may have moved, or a vacancy may have closed. Try one of these:</p>
        <div className="btn-row" style={{ marginTop: 24 }}>
          <Link className="btn" href="/">Home</Link>
          <Link className="btn btn--ghost" href="/services">All services</Link>
          <Link className="btn btn--ghost" href="/careers/vacancies">Vacancies</Link>
          <Link className="btn btn--ghost" href="/contact">Contact</Link>
        </div>
      </div>
    </section>
  );
}
