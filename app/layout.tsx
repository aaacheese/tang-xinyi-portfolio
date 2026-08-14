import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import {
  PORTFOLIO_RETURN_MAX_AGE_MS,
  PORTFOLIO_RETURN_STORAGE_KEY,
} from "./portfolioReturnState";

const preparePortfolioRestore = `
(() => {
  if (window.location.pathname !== "/") return;
  try {
    const state = JSON.parse(sessionStorage.getItem(${JSON.stringify(PORTFOLIO_RETURN_STORAGE_KEY)}) || "null");
    const valid = state && state.restoreRequested === true &&
      (state.section === "experience" || state.section === "projects") &&
      typeof state.sectionOffset === "number" &&
      typeof state.savedAt === "number" &&
      Date.now() - state.savedAt <= ${PORTFOLIO_RETURN_MAX_AGE_MS};
    if (!valid) return;
    document.documentElement.dataset.portfolioRestoring = "true";
    document.documentElement.style.scrollBehavior = "auto";
  } catch {}
})();`;

const applyPortfolioRestore = `
(() => {
  const root = document.documentElement;
  if (root.dataset.portfolioRestoring !== "true") return;
  try {
    const state = JSON.parse(sessionStorage.getItem(${JSON.stringify(PORTFOLIO_RETURN_STORAGE_KEY)}) || "null");
    const section = state && document.getElementById(state.section);
    if (!section || typeof state.sectionOffset !== "number") {
      root.removeAttribute("data-portfolio-restoring");
      root.style.removeProperty("scroll-behavior");
      return;
    }
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const target = Math.min(maxScroll, Math.max(0, sectionTop + state.sectionOffset));
    window.scrollTo(0, target);
  } catch {
    root.removeAttribute("data-portfolio-restoring");
    root.style.removeProperty("scroll-behavior");
  }
  window.setTimeout(() => {
    root.removeAttribute("data-portfolio-restoring");
    root.style.removeProperty("scroll-behavior");
  }, 1500);
})();`;

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;

  return {
    title: "Tang Xinyi — UX & Interaction Designer",
    description:
      "Portfolio of Tang Xinyi, an interaction designer based in Wuxi, China.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Tang Xinyi — UX & Interaction Designer",
      description:
        "Interaction design, user research, information architecture and AI-native experiences.",
      type: "website",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Tang Xinyi — UX & Interaction Designer",
      description:
        "Interaction design, user research, information architecture and AI-native experiences.",
      images: [image],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preparePortfolioRestore }} />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: applyPortfolioRestore }} />
      </body>
    </html>
  );
}
