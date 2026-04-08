import { NextResponse } from "next/server";

export const maxDuration = 30; // Allow up to 30 seconds for parsing

export async function POST(request) {
  try {
    let formData;
    try {
      formData = await request.formData();
    } catch (e) {
      return NextResponse.json({ error: "Could not read uploaded file." }, { status: 400 });
    }

    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API not configured" }, { status: 500 });
    }

    let bytes;
    try {
      bytes = await file.arrayBuffer();
    } catch (e) {
      return NextResponse.json({ error: "Could not read file contents." }, { status: 400 });
    }

    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const fileName = (file.name || "resume.pdf").toLowerCase();

    // Build the message content based on file type
    let content = [];

    if (fileName.endsWith(".pdf")) {
      content.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      });
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      let textContent = "";
      try {
        const mammoth = await import("mammoth");
        const fn = mammoth.extractRawText || mammoth.default?.extractRawText;
        if (fn) {
          const result = await fn({ buffer: buffer });
          textContent = result.value;
        } else {
          throw new Error("mammoth function not found");
        }
      } catch (e) {
        console.error("mammoth error:", e.message);
        // Fallback: basic text extraction
        textContent = buffer
          .toString("utf-8")
          .replace(/[^\x20-\x7E\n\r\t\u00C0-\u024F]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }

      if (!textContent || textContent.length < 20) {
        return NextResponse.json(
          { error: "Could not extract text from this document. Please try a PDF instead." },
          { status: 400 }
        );
      }

      content.push({
        type: "text",
        text: `Here is the text extracted from the uploaded resume document:\n\n${textContent}`,
      });
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or Word document." },
        { status: 400 }
      );
    }

    content.push({
      type: "text",
      text: "Extract all information from this resume and return it as structured JSON.",
    });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: `You are a resume parser. Extract ALL information from the uploaded resume into structured JSON.
Return ONLY valid JSON, no markdown fences, no preamble. Use this exact structure:
{
  "personal": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": ""
  },
  "summary": "The professional summary or objective text exactly as written",
  "experiences": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "startDate": "Mon YYYY",
      "endDate": "Mon YYYY or empty if current",
      "current": false,
      "bullets": ["achievement 1", "achievement 2"]
    }
  ],
  "educations": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "location": "City, Country",
      "year": "YYYY",
      "gpa": "GPA if listed or empty"
    }
  ],
  "skills": {
    "technical": "comma separated technical skills",
    "soft": "comma separated soft skills",
    "certifications": "comma separated certifications"
  }
}

Rules:
- Extract EVERYTHING — do not summarize or shorten bullet points
- Keep bullet points exactly as written in the resume
- If a field is not found, use an empty string
- For dates, normalize to "Mon YYYY" format (e.g. "Jan 2020")
- Separate technical skills, soft skills, and certifications intelligently
- If there's no clear summary section, leave summary empty
- List experiences in reverse chronological order
- Mark the most recent role as current:true if no end date is shown`,
        messages: [{ role: "user", content }],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Anthropic API error:", JSON.stringify(data).slice(0, 500));
      return NextResponse.json(
        { error: "Failed to parse resume. Please try again." },
        { status: 502 }
      );
    }

    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const clean = text.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch (parseErr) {
      // Try to extract JSON from response
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        console.error("JSON parse failed:", text.slice(0, 300));
        return NextResponse.json(
          { error: "Could not parse the resume data. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Parse resume error:", err.message || err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or use a different file." },
      { status: 500 }
    );
  }
}
