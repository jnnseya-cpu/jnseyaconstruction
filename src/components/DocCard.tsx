import type { PolicyDocument } from "@/content/types";
import { formatDate } from "@/lib/format";

export function DocCard({ doc }: { doc: PolicyDocument }) {
  const ready = doc.status === "published" && doc.file;
  return (
    <div className="doc-card">
      <span className="doc-card__icon" aria-hidden="true">PDF</span>
      <div>
        <h3>{doc.title}</h3>
        <p className="meta" style={{ margin: 0 }}>
          {ready ? `Version ${doc.version} · Review date ${formatDate(doc.reviewDate)}` : "In preparation"}
        </p>
      </div>
      {ready ? (
        <a className="btn btn--ghost" href={doc.file} download>
          Download<span className="visually-hidden"> {doc.title} (PDF)</span>
        </a>
      ) : (
        <span className="tag tag--warn">In preparation</span>
      )}
    </div>
  );
}
