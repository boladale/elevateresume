import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { jobTitle, jobType, location, period, resumeText } = await request.json();

    if (!jobTitle) {
      return NextResponse.json(
        { error: "Job title is required" },
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

    // Build pre-filled search URLs for Nigerian job boards
    const q = encodeURIComponent(jobTitle);
    const loc = encodeURIComponent(location || "Nigeria");

    const periodLabels = {
      "24h": "last 24 hours",
      "1w": "last 1 week",
      "2w": "last 2 weeks",
      "1m": "last 1 month",
      "3m": "last 3 months",
    };
    const periodLabel = periodLabels[period] || "last 2 weeks";

    // LinkedIn time filter: r86400=24h, r604800=1w, r1209600=2w, r2592000=1m, blank=anytime
    const linkedInTime = { "24h": "&f_TPR=r86400", "1w": "&f_TPR=r604800", "2w": "&f_TPR=r1209600", "1m": "&f_TPR=r2592000", "3m": "" }[period] || "";
    // Indeed date filter: fromage=1,7,14,30
    const indeedAge = { "24h": "&fromage=1", "1w": "&fromage=7", "2w": "&fromage=14", "1m": "&fromage=30", "3m": "" }[period] || "";

    const jobBoardLinks = {
      jobberman: `https://www.jobberman.com/jobs?q=${q}&l=${loc}`,
      myjobmag: `https://www.myjobmag.com/search/jobs?q=${q}`,
      linkedin: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${loc}${linkedInTime}`,
      indeed: `https://ng.indeed.com/jobs?q=${q}&l=${loc}${indeedAge}`,
      hotnigerianjobs: `https://hotnigerianjobs.com/?s=${q}`,
      ngcareers: `https://ngcareers.com/?s=${q}`,
    };

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: `You are a Nigerian job market expert. Based on your knowledge of the Nigerian job market, generate realistic job listings that match the candidate's profile.

Return ONLY valid JSON. No markdown fences, no preamble, no explanation. Just the raw JSON object.

Use this exact structure:
{
  "jobs": [
    {
      "title": "Job Title",
      "company": "Real Nigerian Company Name",
      "location": "City, Nigeria",
      "type": "Full-time/Part-time/Contract/Remote",
      "salary": "Salary range in NGN if typical for role, or N/A",
      "url": "Direct URL to a job board search page",
      "source": "Jobberman/LinkedIn/Indeed/MyJobMag/etc",
      "matchReason": "Why this matches the candidate's experience",
      "postedDate": "N/A"
    }
  ],
  "searchSummary": "Overview of the job market for this role in this location"
}

IMPORTANT RULES:
- Return 6-8 job entries
- Use REAL Nigerian companies that typically hire for this type of role
- For the "url" field, use these pre-built search URLs and distribute them across entries:
  Jobberman: ${jobBoardLinks.jobberman}
  MyJobMag: ${jobBoardLinks.myjobmag}
  LinkedIn: ${jobBoardLinks.linkedin}
  Indeed: ${jobBoardLinks.indeed}
  HotNigerianJobs: ${jobBoardLinks.hotnigerianjobs}
  NgCareers: ${jobBoardLinks.ngcareers}
- Include realistic salary ranges in Naira where appropriate
- The searchSummary should mention these are recommended searches on Nigerian job boards filtered for listings within the ${periodLabel}, and the candidate should click through to see current live listings
- For the postedDate field, generate realistic dates that fall within the ${periodLabel} timeframe
- Match companies and roles to what actually exists in the Nigerian market`,
        messages: [
          {
            role: "user",
            content: `Find ${jobType} "${jobTitle}" opportunities in "${location || "Nigeria"}" posted within the ${periodLabel}.

Candidate profile for matching:
${resumeText}`,
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("API error:", JSON.stringify(data));
      return NextResponse.json(
        { error: data.error?.message || "Job search failed. Please try again." },
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
      console.error("JSON parse failed. Raw response:", text);
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse job search results");
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Job search failed. Please try again." },
      { status: 500 }
    );
  }
}
