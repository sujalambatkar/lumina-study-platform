import Link from "next/link";
import { notFound } from "next/navigation";
import { DOCS, getDoc } from "@/lib/data";
import DocTabs from "@/components/DocTabs";

export function generateStaticParams() {
  return DOCS.map((d) => ({ id: d.id }));
}

export default async function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = getDoc(id);
  if (!doc) notFound();

  return (
    <>
      <Link href="/" className="text-sm text-[var(--muted)] hover:text-black">← Library</Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{doc.title}</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">{doc.source} · {doc.meta}</p>
      <DocTabs doc={doc} />
    </>
  );
}
