"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════
const STEPS = [
  { key: "personal", label: "Personal", icon: "👤" },
  { key: "summary", label: "Summary", icon: "📝" },
  { key: "experience", label: "Experience", icon: "💼" },
  { key: "education", label: "Education", icon: "🎓" },
  { key: "skills", label: "Skills", icon: "⚡" },
  { key: "jobtools", label: "Job Tools", icon: "🎯" },
  { key: "edit", label: "Edit", icon: "✏️" },
  { key: "preview", label: "Preview", icon: "📄" },
];

const FONTS = {
  "Georgia, serif": "Georgia",
  "'Palatino Linotype', serif": "Palatino",
  "'Book Antiqua', serif": "Book Antiqua",
  "Cambria, serif": "Cambria",
  "'Segoe UI', sans-serif": "Segoe UI",
  "Calibri, sans-serif": "Calibri",
};

const ACCENT_COLORS = {
  "#1a1a2e": "Midnight",
  "#16213e": "Navy",
  "#2d4059": "Steel",
  "#3d0c02": "Mahogany",
  "#1b4332": "Forest",
  "#343a40": "Charcoal",
};

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Internship", "Freelance"];
const JOB_PERIODS = [
  { value: "24h", label: "Last 24 hours" },
  { value: "1w", label: "Last 1 week" },
  { value: "2w", label: "Last 2 weeks" },
  { value: "1m", label: "Last 1 month" },
  { value: "3m", label: "Last 3 months" },
];

const SHARE_TEXT = "I just built my ATS-compliant CV with this free tool — it even scans job boards for matching roles. Try it 👉";
const SHARE_URL = "https://elevateresume.store";

const emptyExp = { title: "", company: "", location: "", startDate: "", endDate: "", current: false, bullets: [""] };
const emptyEdu = { degree: "", school: "", location: "", year: "", gpa: "" };

// ═══════════════════════════════════════════
// DAILY LIMIT HELPERS
// ═══════════════════════════════════════════
const DAILY_LIMIT = 3;

function getTodayKey() {
  return `er_usage_${new Date().toISOString().slice(0, 10)}`;
}
function getUsageCount() {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(getTodayKey()) || "0", 10);
}
function incrementUsage() {
  if (typeof window === "undefined") return;
  const key = getTodayKey();
  localStorage.setItem(key, String(parseInt(localStorage.getItem(key) || "0", 10) + 1));
}
function hasReachedLimit() {
  return getUsageCount() >= DAILY_LIMIT;
}

// ═══════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════
const styles = {
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#4a4a5a", marginBottom: 4 },
  input: {
    width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 8,
    fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  primaryBtn: {
    width: "100%", padding: "12px", borderRadius: 8, border: "none", fontSize: 14,
    fontWeight: 600, color: "#fff", cursor: "pointer",
  },
};

// ═══════════════════════════════════════════
// REUSABLE COMPONENTS (outside main to prevent re-mount)
// ═══════════════════════════════════════════
function Field({ label, value, onChange, placeholder, type = "text", optional, accent }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.label}>
        {label} {optional && <span style={{ fontWeight: 400, color: "#999", fontSize: 11 }}>(optional)</span>}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={styles.input}
        onFocus={(e) => (e.target.style.borderColor = accent || "#1a1a2e")} onBlur={(e) => (e.target.style.borderColor = "")} />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3, accent }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.label}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ ...styles.input, resize: "vertical" }}
        onFocus={(e) => (e.target.style.borderColor = accent || "#1a1a2e")} onBlur={(e) => (e.target.style.borderColor = "")} />
    </div>
  );
}

function Tip({ bg, color, children }) {
  return (
    <div style={{ background: bg, borderRadius: 8, padding: "12px 16px", marginTop: 10, borderLeft: `3px solid ${color}` }}>
      <p style={{ fontSize: 12, color, margin: 0, lineHeight: 1.5 }}>{children}</p>
    </div>
  );
}

function Head({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)", margin: 0 }}>{title}</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>{sub}</p>
    </div>
  );
}

function ShareButtons() {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: "12px 0" }}>
      <a href={`https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + " " + SHARE_URL)}`} target="_blank" rel="noopener noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#25D366", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
        📱 Share on WhatsApp
      </a>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`} target="_blank" rel="noopener noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#1DA1F2", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
        🐦 Share on Twitter
      </a>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function ResumeGenerator() {
  const [step, setStep] = useState(0);
  const [accent, setAccent] = useState("#1a1a2e");
  const [font, setFont] = useState("Georgia, serif");
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState("");
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  // Upload
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  // Form data
  const [personal, setPersonal] = useState({ fullName: "", email: "", phone: "", location: "", linkedin: "", website: "" });
  const [summary, setSummary] = useState("");
  const [experiences, setExperiences] = useState([{ ...emptyExp }]);
  const [educations, setEducations] = useState([{ ...emptyEdu }]);
  const [skills, setSkills] = useState({ technical: "", soft: "", certifications: "" });

  // Job tools
  const [jobTab, setJobTab] = useState("analyze");
  const [jd, setJd] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [applyingIdx, setApplyingIdx] = useState(-1);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchType, setSearchType] = useState("Full-time");
  const [searchPeriod, setSearchPeriod] = useState("2w");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPro, setIsPro] = useState(false);

  // Check saved email and pro status on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("er_email");
      if (saved) { setEmail(saved); setEmailCaptured(true); }
      const pro = localStorage.getItem("er_pro");
      if (pro === "true") setIsPro(true);

      // Check for Paystack redirect activation
      const params = new URLSearchParams(window.location.search);
      if (params.get("pro") === "activated") {
        localStorage.setItem("er_pro", "true");
        setIsPro(true);
        // Clean the URL
        window.history.replaceState({}, "", "/");
      }
    }
  }, []);

  // ——— Form helpers ———
  const up = (k, v) => setPersonal((p) => ({ ...p, [k]: v }));
  const uExp = (i, k, v) => { const c = [...experiences]; c[i] = { ...c[i], [k]: v }; setExperiences(c); };
  const uBullet = (ei, bi, v) => { const c = [...experiences]; c[ei].bullets[bi] = v; setExperiences(c); };
  const addBullet = (ei) => { const c = [...experiences]; c[ei].bullets.push(""); setExperiences(c); };
  const rmBullet = (ei, bi) => { const c = [...experiences]; c[ei].bullets = c[ei].bullets.filter((_, j) => j !== bi); setExperiences(c); };
  const addExp = () => setExperiences((e) => [...e, { ...emptyExp, bullets: [""] }]);
  const rmExp = (i) => setExperiences((e) => e.filter((_, j) => j !== i));
  const uEdu = (i, k, v) => { const c = [...educations]; c[i] = { ...c[i], [k]: v }; setEducations(c); };
  const addEdu = () => setEducations((e) => [...e, { ...emptyEdu }]);
  const rmEdu = (i) => setEducations((e) => e.filter((_, j) => j !== i));

  // ——— Resume upload ———
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx") && !name.endsWith(".doc")) {
      setUploadMsg("Please upload a PDF or Word document (.pdf, .docx)"); return;
    }
    setUploading(true); setUploadMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.personal) setPersonal({ fullName: data.personal.fullName || "", email: data.personal.email || "", phone: data.personal.phone || "", location: data.personal.location || "", linkedin: data.personal.linkedin || "", website: data.personal.website || "" });
      if (data.summary) setSummary(data.summary);
      if (data.experiences?.length) setExperiences(data.experiences.map((exp) => ({ title: exp.title || "", company: exp.company || "", location: exp.location || "", startDate: exp.startDate || "", endDate: exp.endDate || "", current: exp.current || false, bullets: exp.bullets?.length ? exp.bullets : [""] })));
      if (data.educations?.length) setEducations(data.educations.map((edu) => ({ degree: edu.degree || "", school: edu.school || "", location: edu.location || "", year: edu.year || "", gpa: edu.gpa || "" })));
      if (data.skills) setSkills({ technical: data.skills.technical || "", soft: data.skills.soft || "", certifications: data.skills.certifications || "" });
      setUploadMsg("✅ Resume parsed successfully! Review your details across each step.");
      incrementUsage();
    } catch (err) {
      setUploadMsg("❌ " + (err.message || "Failed to parse resume. Try again or fill in manually."));
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ——— Build resume text ———
  const resumeText = useCallback(() => {
    let t = `Name: ${personal.fullName}\nEmail: ${personal.email}\nPhone: ${personal.phone}\nLocation: ${personal.location}\n\nSUMMARY:\n${summary}\n\nEXPERIENCE:\n`;
    experiences.forEach((e) => {
      t += `${e.title} at ${e.company}, ${e.location} (${e.startDate} – ${e.current ? "Present" : e.endDate})\n`;
      e.bullets.filter(Boolean).forEach((b) => (t += `  • ${b}\n`));
    });
    t += `\nEDUCATION:\n`;
    educations.forEach((e) => (t += `${e.degree}, ${e.school} (${e.year})${e.gpa ? ` GPA: ${e.gpa}` : ""}\n`));
    t += `\nSKILLS:\nTechnical: ${skills.technical}\nSoft: ${skills.soft}\nCertifications: ${skills.certifications}`;
    return t;
  }, [personal, summary, experiences, educations, skills]);

  // ——— ATS Score ———
  const atsScore = useCallback(() => {
    let s = 0;
    if (personal.fullName) s += 10;
    if (personal.email) s += 10;
    if (personal.phone) s += 10;
    if (personal.location) s += 5;
    if (summary.length > 40) s += 15;
    if (experiences.some((e) => e.title && e.company)) s += 15;
    if (experiences.some((e) => e.bullets.some((b) => b.length > 10))) s += 10;
    if (educations.some((e) => e.degree && e.school)) s += 10;
    if (skills.technical) s += 10;
    if (skills.certifications) s += 5;
    return Math.min(s, 100);
  }, [personal, summary, experiences, educations, skills]);

  // ——— Email gate ———
  const requireEmail = (action) => {
    if (emailCaptured) return true;
    if (hasReachedLimit()) { setPendingAction(action); setShowEmailGate(true); return false; }
    return true;
  };
  const handleEmailSubmit = async () => {
    if (!email || !email.includes("@")) return;
    localStorage.setItem("er_email", email);
    setEmailCaptured(true); setShowEmailGate(false);

    // Send to Brevo in background
    try {
      await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (e) { /* don't block user */ }

    if (pendingAction === "analyze") handleAnalyze(true);
    if (pendingAction === "search") handleJobSearch(true);
    setPendingAction(null);
  };

  // ——— API: Analyze ———
  const handleAnalyze = async (skipGate = false) => {
    if (!jd.trim()) return;
    if (!skipGate && !requireEmail("analyze")) return;
    setAnalyzing(true); setAnalysis(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeText: resumeText(), jobDescription: jd }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data);
      incrementUsage();
    } catch (e) { setAnalysis({ error: e.message || "Analysis failed." }); }
    setAnalyzing(false);
  };

  // ——— API: Apply Suggestion ———
  const handleApplySuggestion = async (suggestion, idx) => {
    setApplyingIdx(idx);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText(),
          jobDescription: `TASK: Apply this specific suggestion to improve the resume. Return the FULL updated resume sections.

SUGGESTION TO APPLY:
${suggestion}

JOB DESCRIPTION FOR CONTEXT:
${jd}

Return ONLY valid JSON with this structure:
{
  "matchScore": 0,
  "matchedKeywords": [],
  "missingKeywords": [],
  "suggestions": ["Applied successfully"],
  "sectionFeedback": {},
  "updatedSections": {
    "summary": "updated summary text if changed, or null",
    "skills": {
      "technical": "updated technical skills if changed, or null",
      "soft": "updated soft skills if changed, or null",
      "certifications": "updated certifications if changed, or null"
    },
    "experienceBullets": {
      "0": ["updated bullet 1", "updated bullet 2"]
    }
  }
}
Only include fields that were actually changed. Set unchanged fields to null.`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Apply the updates
      if (data.updatedSections) {
        const u = data.updatedSections;
        if (u.summary) setSummary(u.summary);
        if (u.skills) {
          setSkills((prev) => ({
            technical: u.skills.technical || prev.technical,
            soft: u.skills.soft || prev.soft,
            certifications: u.skills.certifications || prev.certifications,
          }));
        }
        if (u.experienceBullets) {
          setExperiences((prev) => {
            const copy = [...prev];
            Object.entries(u.experienceBullets).forEach(([idx, bullets]) => {
              const i = parseInt(idx);
              if (copy[i] && Array.isArray(bullets)) copy[i] = { ...copy[i], bullets };
            });
            return copy;
          });
        }
      }

      // Mark suggestion as applied
      setAnalysis((prev) => {
        if (!prev) return prev;
        const newSuggestions = [...(prev.suggestions || [])];
        newSuggestions[idx] = "✅ " + newSuggestions[idx];
        return { ...prev, suggestions: newSuggestions };
      });
    } catch (e) {
      console.error("Apply suggestion failed:", e);
    }
    setApplyingIdx(-1);
  };

  // ——— API: Job Search ———
  const handleJobSearch = async (skipGate = false) => {
    if (!searchTitle.trim()) return;
    if (!skipGate && !requireEmail("search")) return;
    setSearching(true); setSearchResults(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: searchTitle,
          jobType: searchType,
          location: searchLocation || "Nigeria",
          period: searchPeriod,
          resumeText: resumeText(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSearchResults(data);
      incrementUsage();
    } catch (e) { setSearchResults({ error: e.message || "Search failed." }); }
    setSearching(false);
  };

  // ——— Print/PDF ———
  const handlePrint = () => {
    const el = previewRef.current;
    if (!el) return;
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>${personal.fullName || "Resume"} — CV</title>
<style>
@media print { body { margin: 0; } @page { margin: 0.5in; } }
body { font-family: ${font}; color: #222; line-height: 1.55; padding: 40px; max-width: 800px; margin: 0 auto; }
h1 { font-size: 24px; color: ${accent}; margin: 0 0 4px; }
.contact { font-size: 11px; color: #555; margin-bottom: 14px; } .contact span { margin-right: 12px; }
.sec { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: ${accent}; border-bottom: 1.5px solid ${accent}; padding-bottom: 3px; margin: 16px 0 8px; font-weight: 700; }
p { font-size: 13px; color: #333; margin: 0 0 6px; }
.title { font-weight: 700; font-size: 13px; } .meta { font-size: 12px; color: #555; } .date { font-size: 11px; color: #666; white-space: nowrap; }
ul { margin: 3px 0 10px 16px; padding: 0; } li { font-size: 12.5px; color: #333; margin-bottom: 2px; } strong { font-weight: 600; }
</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 500);
  };

  // ═══════════════════════════════════════════
  // STEP RENDERERS
  // ═══════════════════════════════════════════

  // --- PERSONAL ---
  const renderPersonal = () => (
    <div className="fade-in">
      <Head title="Personal Information" sub="Start with your contact details. ATS systems parse these first." />
      {/* Upload */}
      <div style={{ padding: "20px", borderRadius: 12, marginBottom: 24, background: "linear-gradient(135deg, #f8f9ff, #f0f4ff)", border: "1.5px dashed #b0bfdd", textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>📄</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginBottom: 4, fontFamily: "var(--font-display)" }}>Have an existing CV?</div>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 14, lineHeight: 1.5 }}>Upload your resume and we'll auto-fill everything. Supports PDF and Word.</p>
        <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" onChange={handleFileUpload} style={{ display: "none" }} />
        <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
          style={{ padding: "10px 28px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 600, background: uploading ? "#ccc" : accent, color: "#fff", cursor: uploading ? "default" : "pointer" }}>
          {uploading ? "⏳ Parsing your resume..." : "Upload Resume (PDF or Word)"}
        </button>
        {uploading && (
          <div style={{ marginTop: 12 }}>
            <div style={{ width: "60%", height: 4, borderRadius: 2, margin: "0 auto", overflow: "hidden", background: "#dde3ef" }}><div className="loading-shimmer" style={{ width: "100%", height: "100%" }} /></div>
            <p style={{ fontSize: 11, color: "#888", marginTop: 6 }}>Reading your CV with AI... about 10 seconds</p>
          </div>
        )}
        {uploadMsg && <p style={{ fontSize: 13, marginTop: 10, color: uploadMsg.startsWith("✅") ? "#1a7a1a" : uploadMsg.startsWith("❌") ? "#aa2200" : "#666", lineHeight: 1.5 }}>{uploadMsg}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "#e0e0e6" }} /><span style={{ fontSize: 12, color: "#999", fontWeight: 500 }}>or fill in manually</span><div style={{ flex: 1, height: 1, background: "#e0e0e6" }} />
      </div>
      <Field label="Full Name" value={personal.fullName} onChange={(v) => up("fullName", v)} placeholder="e.g. Adewale Ogundimu" accent={accent} />
      <div style={styles.grid2}>
        <Field label="Email" value={personal.email} onChange={(v) => up("email", v)} placeholder="you@email.com" type="email" accent={accent} />
        <Field label="Phone" value={personal.phone} onChange={(v) => up("phone", v)} placeholder="+234 800 000 0000" accent={accent} />
      </div>
      <Field label="Location" value={personal.location} onChange={(v) => up("location", v)} placeholder="e.g. Lagos, Nigeria" accent={accent} />
      <div style={styles.grid2}>
        <Field label="LinkedIn" value={personal.linkedin} onChange={(v) => up("linkedin", v)} placeholder="linkedin.com/in/yourname" optional accent={accent} />
        <Field label="Website" value={personal.website} onChange={(v) => up("website", v)} placeholder="yoursite.com" optional accent={accent} />
      </div>
    </div>
  );

  // --- SUMMARY ---
  const renderSummary = () => (
    <div className="fade-in">
      <Head title="Professional Summary" sub="Write 2–4 sentences. Include your title, years of experience, and key strengths." />
      <TextArea label="Summary" value={summary} onChange={setSummary} rows={5} accent={accent}
        placeholder="Results-driven Project Manager with 8+ years of experience leading cross-functional teams across ERP implementation, digital transformation, and infrastructure projects..." />
      <Tip bg="#f0f7ff" color="#3366aa"><strong>ATS Tip:</strong> Include keywords from the specific job posting you're targeting.</Tip>
    </div>
  );

  // --- EXPERIENCE ---
  const renderExperience = () => (
    <div className="fade-in">
      <Head title="Work Experience" sub="List roles in reverse chronological order. Start each bullet with an action verb." />
      {experiences.map((exp, i) => (
        <div key={i} style={{ background: "#fafafa", borderRadius: 10, padding: 18, marginBottom: 14, border: "1px solid #eee", position: "relative" }}>
          {experiences.length > 1 && <button onClick={() => rmExp(i)} style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: "#c00", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>×</button>}
          <div style={styles.grid2}>
            <Field label="Job Title" value={exp.title} onChange={(v) => uExp(i, "title", v)} placeholder="Senior Project Manager" accent={accent} />
            <Field label="Company" value={exp.company} onChange={(v) => uExp(i, "company", v)} placeholder="Shell Nigeria" accent={accent} />
          </div>
          <div style={styles.grid3}>
            <Field label="Location" value={exp.location} onChange={(v) => uExp(i, "location", v)} placeholder="Lagos, Nigeria" accent={accent} />
            <Field label="Start Date" value={exp.startDate} onChange={(v) => uExp(i, "startDate", v)} placeholder="Jan 2020" accent={accent} />
            <div>
              <Field label="End Date" value={exp.current ? "Present" : exp.endDate} onChange={(v) => uExp(i, "endDate", v)} placeholder="Dec 2023" accent={accent} />
              <label style={{ fontSize: 11, color: "#666", display: "flex", alignItems: "center", gap: 4, marginTop: -8 }}>
                <input type="checkbox" checked={exp.current} onChange={(e) => uExp(i, "current", e.target.checked)} /> Current role
              </label>
            </div>
          </div>
          <label style={{ ...styles.label, marginBottom: 6 }}>Key Achievements</label>
          {exp.bullets.map((b, bi) => (
            <div key={bi} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ color: "#bbb", fontSize: 18 }}>•</span>
              <input value={b} onChange={(e) => uBullet(i, bi, e.target.value)} placeholder="Led cross-functional team of 15 to deliver ₦2.5B project 3 weeks early..."
                style={{ ...styles.input, flex: 1 }} onFocus={(e) => (e.target.style.borderColor = accent)} onBlur={(e) => (e.target.style.borderColor = "")} />
              {exp.bullets.length > 1 && <button onClick={() => rmBullet(i, bi)} style={{ background: "none", border: "none", color: "#c00", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>×</button>}
            </div>
          ))}
          <button onClick={() => addBullet(i)} style={{ background: "none", border: "none", color: accent, cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "4px 0" }}>+ Add bullet</button>
        </div>
      ))}
      <button onClick={addExp} style={{ width: "100%", padding: "10px", border: `1.5px dashed ${accent}`, borderRadius: 8, background: "transparent", color: accent, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Add Another Position</button>
    </div>
  );

  // --- EDUCATION ---
  const renderEducation = () => (
    <div className="fade-in">
      <Head title="Education" sub="Include degrees, certifications, and relevant coursework." />
      {educations.map((edu, i) => (
        <div key={i} style={{ background: "#fafafa", borderRadius: 10, padding: 18, marginBottom: 14, border: "1px solid #eee", position: "relative" }}>
          {educations.length > 1 && <button onClick={() => rmEdu(i)} style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: "#c00", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>×</button>}
          <div style={styles.grid2}>
            <Field label="Degree" value={edu.degree} onChange={(v) => uEdu(i, "degree", v)} placeholder="B.Sc. Computer Science" accent={accent} />
            <Field label="School" value={edu.school} onChange={(v) => uEdu(i, "school", v)} placeholder="University of Lagos" accent={accent} />
          </div>
          <div style={styles.grid3}>
            <Field label="Location" value={edu.location} onChange={(v) => uEdu(i, "location", v)} placeholder="Lagos, Nigeria" optional accent={accent} />
            <Field label="Year" value={edu.year} onChange={(v) => uEdu(i, "year", v)} placeholder="2018" accent={accent} />
            <Field label="GPA" value={edu.gpa} onChange={(v) => uEdu(i, "gpa", v)} placeholder="4.5/5.0" optional accent={accent} />
          </div>
        </div>
      ))}
      <button onClick={addEdu} style={{ width: "100%", padding: "10px", border: `1.5px dashed ${accent}`, borderRadius: 8, background: "transparent", color: accent, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Add Another Degree</button>
    </div>
  );

  // --- SKILLS ---
  const renderSkills = () => (
    <div className="fade-in">
      <Head title="Skills & Certifications" sub="Separate with commas. ATS systems scan for exact keyword matches." />
      <TextArea label="Technical Skills" value={skills.technical} onChange={(v) => setSkills((sk) => ({ ...sk, technical: v }))} rows={3} accent={accent} placeholder="Project Management, D365 Finance, SAP, Agile, Scrum, Power BI, SQL, Python, Excel..." />
      <TextArea label="Soft Skills" value={skills.soft} onChange={(v) => setSkills((sk) => ({ ...sk, soft: v }))} rows={2} accent={accent} placeholder="Leadership, Stakeholder Management, Strategic Planning, Team Building..." />
      <TextArea label="Certifications" value={skills.certifications} onChange={(v) => setSkills((sk) => ({ ...sk, certifications: v }))} rows={2} accent={accent} placeholder="PMP, PRINCE2, AWS Cloud Practitioner, COREN, NSE..." />
      <Tip bg="#fff8f0" color="#b37800"><strong>Pro tip:</strong> Copy skill phrases directly from the job posting.</Tip>
    </div>
  );

  // --- JOB TOOLS ---
  const renderJobTools = () => (
    <div className="fade-in">
      <Head title="Job Tools" sub="Optimize your CV against a specific role, or find matching jobs on Nigerian boards." />
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderRadius: 10, overflow: "hidden", border: "1.5px solid var(--border)" }}>
        {[{ key: "analyze", label: "🎯 Keyword Analyzer" }, { key: "search", label: "🔍 Find Jobs" }].map((t) => (
          <button key={t.key} onClick={() => setJobTab(t.key)} style={{
            flex: 1, padding: "12px", border: "none", fontSize: 13, fontWeight: 600,
            background: jobTab === t.key ? accent : "#fafafa", color: jobTab === t.key ? "#fff" : "#666", cursor: "pointer", transition: "all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ANALYZE TAB */}
      {jobTab === "analyze" && (
        <div>
          <TextArea label="Paste the Job Description" value={jd} onChange={setJd} rows={7} accent={accent}
            placeholder="Paste the full job description here. The AI will compare it against your CV and identify keyword gaps..." />
          {!emailCaptured && <p style={{ fontSize: 11, color: "#999", marginBottom: 8 }}>⚡ {DAILY_LIMIT - getUsageCount()} free analyses remaining today.</p>}
          {emailCaptured && !isPro && <p style={{ fontSize: 11, color: "#999", marginBottom: 8 }}>⚡ Free plan — <button onClick={() => setShowPaywall(true)} style={{ background: "none", border: "none", color: accent, cursor: "pointer", fontSize: 11, fontWeight: 600, padding: 0, textDecoration: "underline" }}>Upgrade to Pro</button> for unlimited analyses + AI auto-fix</p>}
          <button onClick={() => handleAnalyze()} disabled={analyzing || !jd.trim()} style={{ ...styles.primaryBtn, background: analyzing ? "#ccc" : accent, cursor: analyzing ? "default" : "pointer" }}>
            {analyzing ? "⏳ Analyzing your CV..." : "Analyze CV vs Job Description"}
          </button>

          {analysis && !analysis.error && (
            <div style={{ marginTop: 20 }} className="fade-in">
              {/* Score */}
              <div style={{
                display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 12, marginBottom: 16,
                background: analysis.matchScore >= 75 ? "linear-gradient(135deg, #e6f9e6, #d4f0d4)" : analysis.matchScore >= 50 ? "linear-gradient(135deg, #fff8e6, #fff0cc)" : "linear-gradient(135deg, #ffe6e6, #ffd4d4)",
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: "#fff", fontSize: 22, fontWeight: 800,
                  color: analysis.matchScore >= 75 ? "var(--success)" : analysis.matchScore >= 50 ? "var(--warning)" : "var(--danger)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}>{analysis.matchScore}%</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>{analysis.matchScore >= 75 ? "Strong Match" : analysis.matchScore >= 50 ? "Moderate Match — Fixable" : "Needs Optimization"}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{analysis.matchScore >= 75 ? "Your CV aligns well." : analysis.matchScore >= 50 ? "A few keyword gaps to close." : "Add missing keywords to improve."}</div>
                </div>
              </div>

              {/* Keywords */}
              <div style={styles.grid2}>
                <div style={{ padding: 16, borderRadius: 10, border: "1px solid #c8e6c8", background: "#f6fdf6" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--success)", marginBottom: 8 }}>✓ MATCHED</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(analysis.matchedKeywords || []).map((k, i) => <span key={i} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 12, background: "#d4ecd4", color: "#1a5a1a" }}>{k}</span>)}
                  </div>
                </div>
                <div style={{ padding: 16, borderRadius: 10, border: "1px solid #f0c8c8", background: "#fef6f6" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--danger)", marginBottom: 8 }}>✗ MISSING</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(analysis.missingKeywords || []).map((k, i) => <span key={i} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 12, background: "#f0d4d4", color: "#8a2200" }}>{k}</span>)}
                  </div>
                </div>
              </div>

              {/* Suggestions with Apply buttons */}
              <div style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", background: "#fafaff", marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 10 }}>💡 SUGGESTIONS {isPro ? '— click "Apply" to let AI rewrite that section' : '— upgrade to Pro to auto-apply fixes'}</div>
                {(analysis.suggestions || []).map((sg, i) => {
                  const applied = sg.startsWith("✅");
                  return (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start", padding: "8px 10px", borderRadius: 8, background: applied ? "#f0fdf0" : "#fff", border: "1px solid #eee" }}>
                      <span style={{ color: accent, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}.</span>
                      <span style={{ flex: 1, fontSize: 13, color: "#333", lineHeight: 1.5 }}>{sg}</span>
                      {!applied && isPro && (
                        <button onClick={() => handleApplySuggestion(sg, i)} disabled={applyingIdx >= 0}
                          style={{
                            flexShrink: 0, padding: "5px 14px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600,
                            background: applyingIdx === i ? "#ccc" : accent, color: "#fff",
                            cursor: applyingIdx >= 0 ? "default" : "pointer", whiteSpace: "nowrap",
                          }}>
                          {applyingIdx === i ? "Applying..." : "Apply ✨"}
                        </button>
                      )}
                      {!applied && !isPro && (
                        <button onClick={() => setShowPaywall(true)}
                          style={{
                            flexShrink: 0, padding: "5px 14px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600,
                            background: "linear-gradient(135deg, #e8a020, #d4730e)", color: "#fff",
                            cursor: "pointer", whiteSpace: "nowrap",
                          }}>
                          🔒 Pro
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Section feedback */}
              {analysis.sectionFeedback && (
                <div style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 10 }}>📋 SECTION FEEDBACK</div>
                  {Object.entries(analysis.sectionFeedback).map(([sec, fb]) => (
                    <div key={sec} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#444", textTransform: "capitalize", marginBottom: 3 }}>{sec}</div>
                      <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{fb}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {analysis?.error && <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: "var(--danger-bg)", color: "var(--danger)", fontSize: 13 }}>{analysis.error}</div>}
        </div>
      )}

      {/* SEARCH TAB */}
      {jobTab === "search" && (
        <div>
          <Field label="Job Title / Role" value={searchTitle} onChange={setSearchTitle} placeholder="e.g. Project Manager, Software Engineer, Accountant" accent={accent} />
          <div style={styles.grid3}>
            <div style={{ marginBottom: 14 }}>
              <label style={styles.label}>Job Type</label>
              <select value={searchType} onChange={(e) => setSearchType(e.target.value)} style={{ ...styles.input, background: "#fff" }}>
                {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={styles.label}>Posted Within</label>
              <select value={searchPeriod} onChange={(e) => setSearchPeriod(e.target.value)} style={{ ...styles.input, background: "#fff" }}>
                {JOB_PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <Field label="Location" value={searchLocation} onChange={setSearchLocation} placeholder="e.g. Lagos, Abuja" accent={accent} />
          </div>
          {!emailCaptured && <p style={{ fontSize: 11, color: "#999", marginBottom: 8 }}>⚡ {DAILY_LIMIT - getUsageCount()} free searches remaining today.</p>}
          {emailCaptured && !isPro && <p style={{ fontSize: 11, color: "#999", marginBottom: 8 }}>⚡ Free plan — <button onClick={() => setShowPaywall(true)} style={{ background: "none", border: "none", color: accent, cursor: "pointer", fontSize: 11, fontWeight: 600, padding: 0, textDecoration: "underline" }}>Upgrade to Pro</button> for unlimited searches</p>}
          <button onClick={() => handleJobSearch()} disabled={searching || !searchTitle.trim()} style={{
            ...styles.primaryBtn, background: searching ? "#ccc" : `linear-gradient(135deg, ${accent}, #2d4059)`, cursor: searching ? "default" : "pointer",
          }}>
            {searching ? "🔍 Finding matching opportunities..." : "Search for Matching Jobs"}
          </button>

          {searching && (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: 32, animation: "pulse 1.5s infinite" }}>🔍</div>
              <p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>Matching your profile to Nigerian job boards...</p>
            </div>
          )}

          {searchResults && !searchResults.error && (
            <div style={{ marginTop: 20 }} className="fade-in">
              {searchResults.searchSummary && (
                <div style={{ padding: "14px 16px", borderRadius: 10, background: "#f0f7ff", marginBottom: 16, borderLeft: `3px solid ${accent}` }}>
                  <p style={{ fontSize: 13, color: "#333", margin: 0, lineHeight: 1.6 }}>{searchResults.searchSummary}</p>
                </div>
              )}
              <p style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 12 }}>{(searchResults.jobs || []).length} positions found</p>
              {(searchResults.jobs || []).map((job, i) => (
                <div key={i} style={{ padding: "18px 20px", borderRadius: 12, border: "1px solid var(--border-light)", background: "#fff", marginBottom: 10, transition: "box-shadow 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{job.title}</div>
                      <div style={{ fontSize: 13, color: "#555" }}>{job.company}</div>
                    </div>
                    <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 12, background: "#f0f0f5", color: "#666", whiteSpace: "nowrap", fontWeight: 600 }}>{job.source}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8, fontSize: 11, color: "#666" }}>
                    <span>📍 {job.location}</span><span>💼 {job.type}</span>
                    {job.salary && job.salary !== "N/A" && <span style={{ color: "var(--success)", fontWeight: 600 }}>💰 {job.salary}</span>}
                    {job.postedDate && job.postedDate !== "N/A" && <span>🕐 {job.postedDate}</span>}
                  </div>
                  <p style={{ fontSize: 12, color: "#777", margin: "0 0 10px", lineHeight: 1.5, fontStyle: "italic" }}>{job.matchReason}</p>
                  {job.url && job.url !== "#" && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "6px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: accent, color: "#fff", textDecoration: "none" }}>Apply Now →</a>
                  )}
                </div>
              ))}
            </div>
          )}
          {searchResults?.error && <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: "var(--danger-bg)", color: "var(--danger)", fontSize: 13 }}>{searchResults.error}</div>}
        </div>
      )}
    </div>
  );

  // --- EDIT & REVIEW ---
  const renderEdit = () => (
    <div className="fade-in">
      <Head title="Edit & Review" sub="Review and fine-tune your resume before downloading. Click any field to edit." />

      <div style={{ background: "#fafaff", borderRadius: 10, padding: 18, marginBottom: 14, border: "1px solid #eee" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: accent, marginBottom: 10 }}>📝 PROFESSIONAL SUMMARY</div>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4}
          style={{ ...styles.input, resize: "vertical", fontSize: 13, lineHeight: 1.6 }}
          onFocus={(e) => (e.target.style.borderColor = accent)} onBlur={(e) => (e.target.style.borderColor = "")} />
      </div>

      {experiences.filter((e) => e.title || e.company).map((exp, i) => (
        <div key={i} style={{ background: "#fafaff", borderRadius: 10, padding: 18, marginBottom: 14, border: "1px solid #eee" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent, marginBottom: 4 }}>💼 {exp.title || "Untitled Role"} — {exp.company}</div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 10 }}>{exp.startDate} – {exp.current ? "Present" : exp.endDate} | {exp.location}</div>
          {exp.bullets.map((b, bi) => (
            <div key={bi} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
              <span style={{ color: accent, marginTop: 8 }}>•</span>
              <textarea value={b} onChange={(e) => uBullet(i, bi, e.target.value)} rows={2}
                style={{ ...styles.input, flex: 1, resize: "vertical", fontSize: 13, lineHeight: 1.5 }}
                onFocus={(e) => (e.target.style.borderColor = accent)} onBlur={(e) => (e.target.style.borderColor = "")} />
            </div>
          ))}
          <button onClick={() => addBullet(i)} style={{ background: "none", border: "none", color: accent, cursor: "pointer", fontSize: 11, fontWeight: 600, padding: "2px 0" }}>+ Add bullet</button>
        </div>
      ))}

      <div style={{ background: "#fafaff", borderRadius: 10, padding: 18, marginBottom: 14, border: "1px solid #eee" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: accent, marginBottom: 10 }}>⚡ SKILLS</div>
        <TextArea label="Technical" value={skills.technical} onChange={(v) => setSkills((sk) => ({ ...sk, technical: v }))} rows={2} accent={accent} />
        <TextArea label="Soft Skills" value={skills.soft} onChange={(v) => setSkills((sk) => ({ ...sk, soft: v }))} rows={2} accent={accent} />
        <TextArea label="Certifications" value={skills.certifications} onChange={(v) => setSkills((sk) => ({ ...sk, certifications: v }))} rows={2} accent={accent} />
      </div>

      <Tip bg="#f0f7ff" color="#3366aa"><strong>Tip:</strong> When you're happy with everything, click "Next" to see the final preview and download your PDF.</Tip>
    </div>
  );

  // --- PREVIEW ---
  const renderResumeHTML = () => (
    <div ref={previewRef} style={{ fontFamily: font, color: "#222", lineHeight: 1.55 }}>
      <h1 style={{ fontSize: 24, color: accent, margin: "0 0 4px", fontWeight: 700 }}>{personal.fullName || "Your Full Name"}</h1>
      <div style={{ fontSize: 11, color: "#555", marginBottom: 14, display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
        {personal.email && <span>{personal.email}</span>}
        {personal.phone && <span>{personal.phone}</span>}
        {personal.location && <span>{personal.location}</span>}
        {personal.linkedin && <span>{personal.linkedin}</span>}
        {personal.website && <span>{personal.website}</span>}
      </div>
      {summary && (<><div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: accent, borderBottom: `1.5px solid ${accent}`, paddingBottom: 3, marginBottom: 8, fontWeight: 700 }}>Professional Summary</div><p style={{ fontSize: 13, color: "#333", margin: "0 0 6px" }}>{summary}</p></>)}
      {experiences.some((e) => e.title || e.company) && (<><div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: accent, borderBottom: `1.5px solid ${accent}`, paddingBottom: 3, margin: "14px 0 8px", fontWeight: 700 }}>Experience</div>
        {experiences.filter((e) => e.title || e.company).map((exp, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{exp.title}</span>
              <span style={{ fontSize: 11, color: "#666", whiteSpace: "nowrap" }}>{exp.startDate}{(exp.startDate || exp.endDate || exp.current) && " – "}{exp.current ? "Present" : exp.endDate}</span>
            </div>
            <div style={{ fontSize: 12, color: "#555" }}>{exp.company}{exp.location && `, ${exp.location}`}</div>
            {exp.bullets.some(Boolean) && <ul style={{ margin: "3px 0 0 16px", padding: 0 }}>{exp.bullets.filter(Boolean).map((b, bi) => <li key={bi} style={{ fontSize: 12.5, color: "#333", marginBottom: 2 }}>{b}</li>)}</ul>}
          </div>
        ))}</>)}
      {educations.some((e) => e.degree || e.school) && (<><div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: accent, borderBottom: `1.5px solid ${accent}`, paddingBottom: 3, margin: "14px 0 8px", fontWeight: 700 }}>Education</div>
        {educations.filter((e) => e.degree || e.school).map((edu, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontWeight: 700, fontSize: 13 }}>{edu.degree}</span><span style={{ fontSize: 11, color: "#666" }}>{edu.year}</span></div>
            <div style={{ fontSize: 12, color: "#555" }}>{edu.school}{edu.location && `, ${edu.location}`}{edu.gpa && ` — GPA: ${edu.gpa}`}</div>
          </div>
        ))}</>)}
      {(skills.technical || skills.soft || skills.certifications) && (<><div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: accent, borderBottom: `1.5px solid ${accent}`, paddingBottom: 3, margin: "14px 0 8px", fontWeight: 700 }}>Skills</div>
        {skills.technical && <p style={{ fontSize: 12.5, color: "#333", margin: "0 0 3px" }}><strong>Technical:</strong> {skills.technical}</p>}
        {skills.soft && <p style={{ fontSize: 12.5, color: "#333", margin: "0 0 3px" }}><strong>Soft Skills:</strong> {skills.soft}</p>}
        {skills.certifications && <p style={{ fontSize: 12.5, color: "#333", margin: "0 0 3px" }}><strong>Certifications:</strong> {skills.certifications}</p>}
      </>)}
    </div>
  );

  const renderPreview = () => (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <Head title="Final Preview" sub="This is exactly how your CV will look. Ready to download." />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: atsScore() >= 80 ? "var(--success-bg)" : atsScore() >= 50 ? "var(--warning-bg)" : "var(--danger-bg)",
            color: atsScore() >= 80 ? "var(--success)" : atsScore() >= 50 ? "var(--warning)" : "var(--danger)",
            fontSize: 16, fontWeight: 800,
          }}>{atsScore()}%</div>
          <span style={{ fontSize: 11, color: "#888", lineHeight: 1.3 }}>ATS<br />Score</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16, padding: "10px 14px", background: "#f8f8fa", borderRadius: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#888" }}>Font:</span>
          <select value={font} onChange={(e) => setFont(e.target.value)} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid #ddd" }}>
            {Object.entries(FONTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#888" }}>Color:</span>
          {Object.entries(ACCENT_COLORS).map(([hex, name]) => (
            <button key={hex} onClick={() => setAccent(hex)} title={name} style={{ width: 22, height: 22, borderRadius: "50%", border: accent === hex ? "2.5px solid #333" : "2px solid #ddd", background: hex, cursor: "pointer", padding: 0 }} />
          ))}
        </div>
        <button onClick={() => setStep(6)} style={{ marginLeft: "auto", padding: "5px 14px", borderRadius: 6, border: `1px solid ${accent}`, background: "transparent", color: accent, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✏️ Back to Edit</button>
      </div>

      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 4, padding: "36px 44px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", maxHeight: 550, overflowY: "auto" }}>
        {renderResumeHTML()}
      </div>

      <button onClick={handlePrint} style={{
        width: "100%", marginTop: 16, padding: "14px 20px", background: accent, color: "#fff",
        border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer",
      }}>📄 Download as PDF</button>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>Found this helpful? Share with someone job hunting 🇳🇬</p>
        <ShareButtons />
      </div>
    </div>
  );

  const stepRenderers = [renderPersonal, renderSummary, renderExperience, renderEducation, renderSkills, renderJobTools, renderEdit, renderPreview];

  // ═══════════════════════════════════════════
  // EMAIL GATE MODAL
  // ═══════════════════════════════════════════
  const EmailGateModal = () => (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>⚡</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", margin: "0 0 6px" }}>Unlock Unlimited AI Features</h3>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 20, lineHeight: 1.6 }}>
            You've used your {DAILY_LIMIT} free AI analyses for today. Enter your email for unlimited access — plus weekly job market tips for Nigerian professionals.
          </p>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
            style={{ ...styles.input, marginBottom: 12, textAlign: "center" }}
            onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()} />
          <button onClick={handleEmailSubmit} style={{ ...styles.primaryBtn, background: accent, marginBottom: 8 }}>Unlock Unlimited Access</button>
          <button onClick={() => setShowEmailGate(false)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 12 }}>Maybe later</button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #2d4059 100%)", padding: "24px 20px 20px", color: "#fff", textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 2px", fontFamily: "var(--font-display)", letterSpacing: 0.5 }}>ElevateResume</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "0 0 12px" }}>Build an ATS-compliant CV • Optimize keywords • Find matching jobs • <a href="/blog" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "underline" }}>Blog</a></p>
        <ShareButtons />
      </header>

      <nav style={{ display: "flex", justifyContent: "center", padding: "14px 10px 0", gap: 3, flexWrap: "wrap" }}>
        {STEPS.map((st, i) => (
          <button key={st.key} onClick={() => setStep(i)} style={{
            padding: "5px 10px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: step === i ? 700 : 500,
            background: step === i ? accent : i < step ? "#d4e6d4" : "#e8e8ec",
            color: step === i ? "#fff" : i < step ? "#2a6a2a" : "#888",
            cursor: "pointer", transition: "all 0.2s",
          }}>{st.icon} {st.label}</button>
        ))}
      </nav>

      <main style={{ maxWidth: 720, margin: "18px auto", padding: "0 16px 40px" }}>
        <div style={{ background: "var(--card)", borderRadius: 14, padding: "26px 24px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          {stepRenderers[step]()}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} style={{
            padding: "10px 22px", borderRadius: 8, border: "1.5px solid var(--border)", background: "#fff",
            color: step === 0 ? "#ccc" : "#444", cursor: step === 0 ? "default" : "pointer", fontSize: 13, fontWeight: 600,
          }}>← Back</button>
          {step < STEPS.length - 1 && (
            <button onClick={() => setStep((s) => s + 1)} style={{
              padding: "10px 22px", borderRadius: 8, border: "none", background: accent,
              color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>Next →</button>
          )}
        </div>
      </main>

      <footer style={{ textAlign: "center", padding: "20px 16px 30px", borderTop: "1px solid var(--border-light)" }}>
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 8 }}>Built for Nigerian job seekers 🇳🇬 • <a href="/blog" style={{ color: "#1a1a2e", textDecoration: "none", fontWeight: 600 }}>Read the Blog</a></p>
        <ShareButtons />
      </footer>

      {showEmailGate && <EmailGateModal />}
      {showPaywall && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "36px 32px", maxWidth: 480, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", position: "relative" }}>
            <button onClick={() => setShowPaywall(false)} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999" }}>×</button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✨</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)", margin: "0 0 8px" }}>Upgrade to ElevateResume Pro</h3>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 24, lineHeight: 1.6 }}>
                Let AI automatically fix your CV based on each suggestion. One click and your resume is optimised for the job.
              </p>
              <div style={{ textAlign: "left", marginBottom: 24 }}>
                {[
                  "AI auto-applies keyword suggestions to your CV",
                  "Unlimited keyword analyses per day",
                  "Priority AI processing (faster results)",
                  "All future Pro features included",
                ].map((f) => (
                  <div key={f} style={{ fontSize: 13, color: "#444", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "#1a7a1a", fontSize: 16 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <div style={{ background: "#f8f8fa", borderRadius: 10, padding: "16px", marginBottom: 20 }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: accent, fontFamily: "var(--font-display)" }}>₦2,000<span style={{ fontSize: 14, fontWeight: 400, color: "#888" }}>/month</span></div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>Cancel anytime • Instant access</div>
              </div>
              <a href="https://paystack.shop/pay/l63u6qn2m3" target="_blank" rel="noopener noreferrer"
                style={{
                  display: "block", width: "100%", padding: "14px 20px", background: "linear-gradient(135deg, #1a1a2e, #2d4059)",
                  color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
                  textDecoration: "none", textAlign: "center",
                }}>
                Upgrade to Pro — ₦2,000/month
              </a>
              <p style={{ fontSize: 11, color: "#aaa", marginTop: 12 }}>Pay securely with Paystack • Debit card, bank transfer, or USSD</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
