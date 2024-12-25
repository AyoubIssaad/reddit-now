import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({
  title = "Reddit-Now - Real-time Reddit Thread Viewer",
  description = "Watch Reddit threads update in real-time. No account needed, just paste a URL and start following discussions as they happen.",
  canonicalUrl,
  ogImage = "/og-image.jpg",
  threadInfo = null,
}) => {
  // Generate dynamic meta based on thread info if available
  const pageTitle = threadInfo
    ? `${threadInfo.title} - Reddit-Now Live Thread`
    : title;

  const pageDescription = threadInfo
    ? `Follow this Reddit discussion in r/${threadInfo.subreddit} in real-time. Live updates every 30 seconds.`
    : description;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl || window.location.href} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl || window.location.href} />
      <meta property="og:site_name" content="Reddit-Now" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional Meta Tags */}
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
        {JSON.stringify({
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
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
