import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "CompetitorIQ — AI Competitive Intelligence",
    description:
        "Instant competitive intelligence reports powered by AI. Understand your market in minutes.",
    keywords: ["competitive intelligence", "market research", "AI", "competitor analysis"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="bg-background text-text-primary min-h-screen antialiased">
                {children}
            </body>
        </html>
    );
}
