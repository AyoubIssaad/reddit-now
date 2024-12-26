// src/components/SEO.jsx
import React from "react";
import { Helmet } from "react-helmet-async";

const DEFAULT_TITLE = "Reddit-Now - Real-time Reddit Thread Viewer";
const DEFAULT_DESCRIPTION =
  "Watch Reddit threads update in real-time. No account needed, just paste a URL and start following discussions as they happen.";
const DEFAULT_IMAGE = "/og-image.jpg";

const SEO = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogImage = DEFAULT_IMAGE,
  threadInfo = null,
  robotsContent = "index, follow",
}) => {
  const pageTitle = threadInfo
    ? `${threadInfo.title} - Reddit-Now Live Thread`
    : title;

  const pageDescription = threadInfo
    ? `Follow this Reddit discussion in r/${threadInfo.subreddit} in real-time. Live updates every 30 seconds.`
    : description;

  const currentUrl = canonicalUrl || window.location.href;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Reddit-Now",
    applicationCategory: "Social Media Tool",
    operatingSystem: "Web",
    description: description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={currentUrl} />
      <meta name="robots" content={robotsContent} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Reddit-Now" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Theme and App Meta */}
      <meta name="application-name" content="Reddit-Now" />
      <meta name="apple-mobile-web-app-title" content="Reddit-Now" />
      <meta
        name="theme-color"
        content="#ffffff"
        media="(prefers-color-scheme: light)"
      />
      <meta
        name="theme-color"
        content="#0f172a"
        media="(prefers-color-scheme: dark)"
      />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
