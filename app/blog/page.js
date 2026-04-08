import Link from "next/link";
import { getAllPosts } from "./utils";

export const metadata = {
  title: "Blog — ElevateResume | CV Tips for Nigerian Job Seekers",
  description:
    "Expert CV writing tips, ATS optimization guides, and job search strategies for Nigerian professionals and graduates.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f7" }}>
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #2d4059 100%)",
          padding: "40px 20px",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <Link
          href="/"
          style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 13 }}
        >
          ← Back to Resume Builder
        </Link>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            margin: "12px 0 4px",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          ElevateResume Blog
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: 0 }}>
          CV tips, ATS guides, and job search strategies for Nigerian professionals
        </p>
      </header>

      {/* Posts */}
      <main style={{ maxWidth: 720, margin: "30px auto", padding: "0 16px 60px" }}>
        {posts.length === 0 && (
          <p style={{ textAlign: "center", color: "#888", fontSize: 14, marginTop: 40 }}>
            Blog posts coming soon!
          </p>
        )}

        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <article
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "24px 28px",
                marginBottom: 16,
                border: "1px solid #eee",
                cursor: "pointer",
              }}
            >
              {post.category && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#1a1a2e",
                    background: "#e8ecf4",
                    padding: "3px 10px",
                    borderRadius: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {post.category}
                </span>
              )}
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  margin: "10px 0 6px",
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                {post.title}
              </h2>
              <p style={{ fontSize: 14, color: "#666", margin: "0 0 10px", lineHeight: 1.6 }}>
                {post.excerpt}
              </p>
              <div style={{ fontSize: 12, color: "#999" }}>
                {post.date} · {post.readTime || "5 min read"}
              </div>
            </article>
          </Link>
        ))}
      </main>
    </div>
  );
}
