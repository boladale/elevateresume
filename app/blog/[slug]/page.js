import Link from "next/link";
import { getPost, getAllSlugs } from "../utils";
import { notFound } from "next/navigation";

const BASE_URL = "https://elevateresume.store";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | ElevateResume Blog`,
    description: post.excerpt,
    keywords: post.keywords || [],
    authors: [{ name: post.author || "ElevateResume" }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${BASE_URL}/blog/${post.slug}`,
      siteName: "ElevateResume",
      type: "article",
      locale: "en_NG",
      publishedTime: post.date,
      authors: [post.author || "ElevateResume"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${post.slug}`,
    },
  };
}

export default function BlogPost({ params }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  // Schema.org structured data for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Organization",
      name: post.author || "ElevateResume",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "ElevateResume",
      url: BASE_URL,
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f7" }}>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #2d4059 100%)",
        padding: "30px 20px", color: "#fff", textAlign: "center",
      }}>
        <Link href="/blog" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 13 }}>← All Posts</Link>
        {post.category && (
          <div style={{ marginTop: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.15)", padding: "3px 12px", borderRadius: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{post.category}</span>
          </div>
        )}
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "12px auto 6px", maxWidth: 640, fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.3 }}>{post.title}</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
          {post.date} · {post.readTime || "5 min read"}{post.author && ` · By ${post.author}`}
        </p>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 680, margin: "30px auto", padding: "0 16px 60px" }}>
        <article style={{ background: "#fff", borderRadius: 14, padding: "36px 32px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          {post.body.map((block, i) => {
            if (block.type === "p") return <p key={i} style={{ fontSize: 15, color: "#333", lineHeight: 1.8, margin: "0 0 18px" }}>{block.text}</p>;
            if (block.type === "h2") return <h2 key={i} style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: "28px 0 10px", fontFamily: "'Playfair Display', Georgia, serif" }}>{block.text}</h2>;
            if (block.type === "h3") return <h3 key={i} style={{ fontSize: 17, fontWeight: 700, color: "#2d4059", margin: "22px 0 8px" }}>{block.text}</h3>;
            if (block.type === "list") return (
              <ul key={i} style={{ margin: "0 0 18px 20px", padding: 0, fontSize: 15, color: "#333", lineHeight: 1.8 }}>
                {block.items.map((item, j) => <li key={j} style={{ marginBottom: 6 }}>{item}</li>)}
              </ul>
            );
            if (block.type === "tip") return (
              <div key={i} style={{ background: "#f0f7ff", borderRadius: 8, padding: "14px 18px", margin: "0 0 18px", borderLeft: "3px solid #3366aa", fontSize: 14, color: "#333", lineHeight: 1.6 }}>
                <strong>💡 Tip:</strong> {block.text}
              </div>
            );
            if (block.type === "cta") return (
              <div key={i} style={{ background: "linear-gradient(135deg, #1a1a2e, #2d4059)", borderRadius: 12, padding: "24px 28px", margin: "24px 0", textAlign: "center" }}>
                <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: "0 0 12px" }}>{block.text}</p>
                <Link href="/" style={{ display: "inline-block", padding: "10px 28px", background: "#fff", color: "#1a1a2e", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Build Your ATS CV Free →</Link>
              </div>
            );
            return null;
          })}
        </article>

        {/* Share */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Found this helpful? Share it 🇳🇬</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <a href={`https://wa.me/?text=${encodeURIComponent(post.title + " — " + BASE_URL + "/blog/" + post.slug)}`} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#25D366", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>📱 WhatsApp</a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(BASE_URL + "/blog/" + post.slug)}`} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#1DA1F2", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>🐦 Twitter</a>
          </div>
        </div>
      </main>
    </div>
  );
}
