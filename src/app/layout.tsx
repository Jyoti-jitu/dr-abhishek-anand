import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";


const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Dr. Abhishek Anand | Paediatric Surgeon in Bhubaneswar | New Life Clinic",
  description: "Specialist paediatric surgical care and paediatric urology for children and newborns. Consult Dr. Abhishek Anand at New Life Clinic, Soubhagya Nagar, Bhubaneswar, Odisha.",
  keywords: [
    "Dr. Abhishek Anand Paediatric Surgeon",
    "Paediatric Surgeon in Bhubaneswar",
    "New Life Clinic Soubhagya Nagar",
    "Paediatric Surgery Consultation Bhubaneswar",
    "Paediatric Urology Bhubaneswar",
    "Neonatal Surgeon Odisha",
    "Child Specialist Surgeon Bhubaneswar"
  ],
  authors: [{ name: "Dr. Abhishek Anand" }, { name: "JOVIX Technologies", url: "https://www.jovix.co.uk" }],
  creator: "JOVIX Technologies",
  publisher: "JOVIX Technologies",
  metadataBase: new URL("https://drabhishekanand.in"),
  openGraph: {
    title: "Dr. Abhishek Anand | Paediatric Surgeon in Bhubaneswar",
    description: "Specialist surgical care for children. Clear guidance for families. Practicing at New Life Clinic, Soubhagya Nagar, Bhubaneswar.",
    url: "https://drabhishekanand.in",
    siteName: "Dr. Abhishek Anand — Paediatric Surgery",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/dr-abhishek-anand.jpg",
        width: 1200,
        height: 630,
        alt: "Dr. Abhishek Anand, Paediatric Surgeon"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Abhishek Anand | Paediatric Surgeon in Bhubaneswar",
    description: "Specialist surgical care for children at New Life Clinic, Soubhagya Nagar, Bhubaneswar.",
    images: ["/images/dr-abhishek-anand.jpg"]
  },
  robots: {
    index: true,
    follow: true
  }
};

import { Suspense } from "react";
import PublicShell from "@/components/PublicShell";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": "Dr. Abhishek Anand",
    "image": "https://drabhishekanand.in/images/dr-abhishek-anand.jpg",
    "medicalSpecialty": ["PediatricSurgery", "Urology"],
    "description": "Consultant Paediatric Surgeon and Paediatric Urologist providing specialized surgical consultations for infants, children, and newborns at New Life Clinic, Soubhagya Nagar, Bhubaneswar.",
    "telephone": "+91-9124616273",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Soubhagya Nagar",
      "addressLocality": "Bhubaneswar",
      "addressRegion": "Odisha",
      "postalCode": "751003",
      "addressCountry": "IN"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "17:00",
        "closes": "21:00"
      }
    ],
    "hospitalAffiliation": [
      {
        "@type": "Hospital",
        "name": "Rahat Hospital (Centre for Woman & Child Care)",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bhubaneswar",
          "addressRegion": "Odisha",
          "addressCountry": "IN"
        }
      }
    ],
    "worksFor": {
      "@type": "MedicalClinic",
      "name": "New Life Clinic",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Soubhagya Nagar",
        "addressLocality": "Bhubaneswar",
        "addressRegion": "Odisha",
        "postalCode": "751003",
        "addressCountry": "IN"
      }
    }
  };

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${manrope.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-warm-white text-charcoal font-sans selection:bg-teal-light selection:text-navy">
        <Suspense fallback={<main className="flex-1 min-h-screen bg-slate-50">{children}</main>}>
          <PublicShell>{children}</PublicShell>
        </Suspense>
      </body>
    </html>
  );
}
