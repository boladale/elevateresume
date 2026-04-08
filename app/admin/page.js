"use client";

import { useState } from "react";

export default function AdminWriter() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("CV Writing");
  const [keywords, setKeywords] = useState("");
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");

  const categories = ["CV Writing", "Graduate Guide", "Job Search", "Interview Tips", "Career Advice", "ATS Guide"];

  // Generate post with AI
  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert("AI generation failed: " + (data.error || "Unknown error"));
      } else if (data.title) {
        setTitle(data.title);
        setExcerpt(data.excerpt || "");
        setCategory(data.category || "CV Writing");
        setKeywords((data.keywords || []).join(", "));
        setBody(data.body || "");
      }
    } catch (e) {
      alert("Failed to generate. Please try again.");
    }
    setGenerating(false);
  };

  // Convert body text to structured blocks
  const parseBody = (text) => {
    const lines = text.split("\n");
    const blocks = [];
    let currentList = [];

    const flushList = () => {
      if (currentList.length > 0) {
        blocks.push({ type: "list", items: [...currentList] });
        currentList = [];
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("## ")) {
        flushList();
        blocks.push({ type: "h2", text: trimmed.replace("## ", "") });
      } else if (trimmed.startsWith("### ")) {
        flushList();
        blocks.push({ type: "h3", text: trimmed.replace("### ", "") });
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        currentList.push(trimmed.replace(/^[-•]\s*/, ""));
      } else if (trimmed.startsWith("[TIP]")) {
        flushList();
        blocks.push({ type: "tip", text: trimmed.replace("[TIP]", "").trim() });
      } else if (trimmed.startsWith("[CTA]")) {
        flushList();
        blocks.push({ type: "cta", text: trimmed.replace("[CTA]", "").trim() || "Ready to build your ATS-proof CV?" });
      } else {
        flushList();
        blocks.push({ type: "p", text: trimmed });
      }
    }
    flushList();
    return blocks;
  };

  // Download as JSON
  const handleDownload = () => {
    if (!title || !body) {
      alert("Please fill in at least the title and body.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60);

    const post = {
      title,
      excerpt,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      readTime: Math.max(3, Math.round(body.split(/\s+/).length / 200)) + " min read",
      category,
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      author: "ElevateResume",
      body: parseBody(body),
    };

    const filename = `${today}-${slug}.json`;
    const blob = new Blob([JSON.stringify(post, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    alert(`Downloaded "${filename}"\n\nTo publish:\n1. Put this file in C:\\elevateresume\\content\\\n2. Open Command Prompt and run:\n   cd C:\\elevateresume\n   git add .\n   git commit -m "New post: ${title}"\n   git push`);
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 8,
    fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f7", fontFamily: "'DM Sans', sans-serif" }}>
      <header style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #2d4059 100%)", padding: "30px 20px", color: "#fff", textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", fontFamily: "'Playfair Display', Georgia, serif" }}>Blog Post Writer</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Write or AI-generate SEO articles for ElevateResume</p>
      </header>

      <main style={{ maxWidth: 700, margin: "24px auto", padding: "0 16px 60px" }}>

        {/* AI Generator */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "24px", marginBottom: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: "0 0 12px" }}>🤖 Generate with AI</h2>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>Just type a topic and AI will write the full article with SEO keywords.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g. How to write a CV for oil and gas jobs in Nigeria"
              style={{ ...inputStyle, flex: 1 }}
              onKeyDown={(e) => e.key === "Enter" && handleAIGenerate()} />
            <button onClick={handleAIGenerate} disabled={generating || !aiTopic.trim()}
              style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: generating ? "#ccc" : "#1a1a2e", color: "#fff", fontSize: 13, fontWeight: 600, cursor: generating ? "default" : "pointer", whiteSpace: "nowrap" }}>
              {generating ? "Writing..." : "Generate ✨"}
            </button>
          </div>
        </div>

        {/* Manual Editor */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "24px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: "0 0 16px" }}>✍️ Article Details</h2>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 4 }}>Title (under 60 chars for SEO)</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="How to Write an ATS-Friendly CV for Nigerian Banks" style={inputStyle} />
            <span style={{ fontSize: 11, color: title.length > 60 ? "#c00" : "#999" }}>{title.length}/60</span>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 4 }}>Excerpt / Meta Description (under 160 chars)</label>
            <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="A compelling 1-2 sentence description that appears in Google search results" style={inputStyle} />
            <span style={{ fontSize: 11, color: excerpt.length > 160 ? "#c00" : "#999" }}>{excerpt.length}/160</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 4 }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputStyle, background: "#fff" }}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 4 }}>SEO Keywords (comma-separated)</label>
              <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="ATS CV Nigeria, banking CV format" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 4 }}>Article Body</label>
            <div style={{ background: "#f8f8fa", borderRadius: 6, padding: "8px 12px", marginBottom: 8, fontSize: 12, color: "#666", lineHeight: 1.6 }}>
              <strong>Formatting guide:</strong> Just write normally. Use <code>## </code> for big headings, <code>### </code> for small headings, <code>- </code> for bullet points, <code>[TIP]</code> for tip boxes, <code>[CTA]</code> for call-to-action buttons.
            </div>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={20}
              placeholder={`Start writing your article here...\n\n## First Section Heading\n\nYour paragraph text goes here. Just write normally.\n\n- Bullet point one\n- Bullet point two\n\n[TIP] A helpful tip for your readers.\n\n## Second Section Heading\n\nMore content...\n\n[CTA] Ready to build your ATS-proof CV?`}
              style={{ ...inputStyle, resize: "vertical", fontSize: 14, lineHeight: 1.7, minHeight: 400 }} />
            <span style={{ fontSize: 11, color: "#999" }}>{body.split(/\s+/).filter(Boolean).length} words</span>
          </div>

          <button onClick={handleDownload}
            style={{ width: "100%", padding: "14px", borderRadius: 8, border: "none", background: "#1a1a2e", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            📥 Download Blog Post File
          </button>

          <div style={{ background: "#f0f7ff", borderRadius: 8, padding: "14px 16px", marginTop: 14, borderLeft: "3px solid #3366aa" }}>
            <p style={{ fontSize: 13, color: "#333", margin: 0, lineHeight: 1.6 }}>
              <strong>After downloading:</strong> Put the file in <code>C:\elevateresume\content\</code> then open Command Prompt and run:<br />
              <code style={{ display: "block", background: "#eee", padding: 8, borderRadius: 4, marginTop: 6, fontSize: 12 }}>
                cd C:\elevateresume<br />
                git add .<br />
                git commit -m "New blog post"<br />
                git push
              </code>
              Your article will be live on elevateresume.store/blog within 60 seconds.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
