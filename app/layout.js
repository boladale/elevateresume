import "./globals.css";

export const metadata = {
  title: "ElevateResume — Free ATS Resume Builder for Nigerian Job Seekers",
  description:
    "Build a professional, ATS-compliant CV in minutes. Free resume generator with keyword analyzer and job search — built for Nigerian professionals and graduates.",
  keywords: [
    "ATS resume builder",
    "free CV maker Nigeria",
    "ATS compliant CV",
    "Nigerian resume builder",
    "NYSC CV template",
    "graduate CV format Nigeria",
    "Jobberman CV",
    "resume generator",
    "ATS friendly CV Nigeria",
  ],
  openGraph: {
    title: "ElevateResume — Free ATS Resume Builder",
    description:
      "Build a professional, ATS-compliant CV in minutes. Keyword analyzer + job search included.",
    url: "https://elevateresume.store",
    siteName: "ElevateResume",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "ElevateResume — Free ATS Resume Builder",
    description:
      "Build a professional, ATS-compliant CV in minutes. Built for Nigerian job seekers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
