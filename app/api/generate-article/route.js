import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API not configured" }, { status: 500 });
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
        max_tokens: 4096,
        system: `You are an SEO blog writer for ElevateResume, a free ATS resume builder for Nigerian job seekers.

Return ONLY valid JSON. No markdown fences, no preamble, no explanation. Just raw JSON.

Use this exact structure:
{
  "title": "SEO-optimized article title (include Nigeria or Nigerian if relevant, under 60 chars)",
  "excerpt": "Compelling 1-2 sentence description for search results (under 160 chars)",
  "category": "One of: CV Writing, Graduate Guide, Job Search, Interview Tips, Career Advice, ATS Guide",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "readTime": "X min read",
  "body": "The full article text with paragraphs separated by double newlines. Use ## for H2 headings, ### for H3 headings, - for bullet list items, [TIP] for tip boxes, and [CTA] for call-to-action boxes. Write 1500-2500 words. Be specific to the Nigerian job market. Include actionable advice."
}

IMPORTANT SEO RULES:
- Title should be under 60 characters and include the primary keyword
- Excerpt should be under 160 characters
- Include 5-7 keywords that Nigerian job seekers would actually search for
- Use H2 headings every 200-300 words
- Include at least one [CTA] block
- Reference specific Nigerian companies, job boards, and scenarios
- Write in a helpful, authoritative tone`,
        messages: [
          {
            role: "user",
            content: `Write a complete SEO blog article about: ${topic}`,
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Anthropic error:", JSON.stringify(data).slice(0, 500));
      return NextResponse.json(
        { error: data.error?.message || "AI generation failed" },
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
    } catch (e) {
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        console.error("JSON parse failed:", text.slice(0, 300));
        return NextResponse.json(
          { error: "Failed to parse AI response. Try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: "Article generation failed. Please try again." },
      { status: 500 }
    );
  }
}
