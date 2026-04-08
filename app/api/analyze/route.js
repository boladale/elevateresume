import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Resume and job description are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API not configured" },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `You are an ATS resume optimization expert. Analyze the resume against the job description.
Return ONLY valid JSON, no markdown fences, no preamble. Use this exact structure:
{
  "matchScore": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4"],
  "sectionFeedback": {
    "summary": "feedback text",
    "experience": "feedback text",
    "skills": "feedback text",
    "education": "feedback text"
  }
}`,
        messages: [
          {
            role: "user",
            content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Anthropic API error:", data);
      return NextResponse.json(
        { error: "Analysis service unavailable" },
        { status: 502 }
      );
    }

    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
