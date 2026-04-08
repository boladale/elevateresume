import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      // Still save locally even if Brevo isn't configured
      console.log("Brevo not configured. Email captured:", email);
      return NextResponse.json({ success: true, note: "Brevo not configured" });
    }

    // Add contact to Brevo
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        listIds: [parseInt(process.env.BREVO_LIST_ID || "2")],
        attributes: {
          SOURCE: "elevateresume_app",
          SIGNUP_DATE: new Date().toISOString().slice(0, 10),
        },
        updateEnabled: true, // Update if contact already exists
      }),
    });

    const data = await res.json();

    if (!res.ok && res.status !== 204) {
      // 409 = contact already exists, that's fine
      if (res.status === 409) {
        return NextResponse.json({ success: true, existing: true });
      }
      console.error("Brevo error:", data);
      return NextResponse.json({ success: true, note: "Brevo sync failed but email accepted" });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email capture error:", err);
    // Don't block the user even if Brevo fails
    return NextResponse.json({ success: true });
  }
}
