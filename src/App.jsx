import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/layout/Header";
import Container from "./components/layout/Container";
import ThreadViewer from "./components/features/ThreadViewer/ThreadViewer";
import RedditRoute from "./components/features/RedditRoute/RedditRoute";
import SEO from "./components/SEO";

// Homepage component with default SEO
const Home = () => (
  <Container>
    <SEO
      title="Reddit-Now - Watch Reddit Threads Live"
      description="Follow Reddit discussions in real-time without refreshing. Just paste a thread URL and start watching the conversation unfold live."
      canonicalUrl="https://reddit-now.com"
    />
    <div className="space-y-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-3">
          Live Reddit Experience
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Never miss a moment of the conversation! Here's how to get started:
        </p>
        <div className="space-y-2 mb-6">
          <div className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <p className="text-sm text-muted-foreground">
              Paste any Reddit thread URL in the box below
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <p className="text-sm text-muted-foreground">
              Or simply replace{" "}
              <span className="font-mono bg-muted px-1 rounded">
                reddit.com
              </span>{" "}
              with{" "}
              <span className="font-mono bg-muted px-1 rounded">
                reddit-now.com
              </span>{" "}
              in any Reddit URL
            </p>
          </div>
        </div>
        <ThreadViewer hideHeader={true} />
      </div>
    </div>
  </Container>
);

// 404 Page Component
const NotFound = () => (
  <Container>
    <SEO
      title="404 - Page Not Found | Reddit-Now"
      description="The page you're looking for doesn't exist. Try pasting a Reddit thread URL to start watching comments in real-time."
      robotsContent="noindex, follow"
    />
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The page you're looking for doesn't exist. Head back home to start
        watching Reddit threads.
      </p>
      <a
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go Home
      </a>
    </div>
  </Container>
);

// Main App Component
function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <Routes>
            {/* Homepage Route */}
            <Route path="/" element={<Home />} />

            {/* Reddit-style Routes */}
            <Route
              path="/r/:subreddit/comments/:id"
              element={<RedditRoute />}
            />
            <Route
              path="/r/:subreddit/comments/:id/:title"
              element={<RedditRoute />}
            />
            <Route
              path="/r/:subreddit/comments/:id/:title/"
              element={<RedditRoute />}
            />

            {/* 404 Route */}
            <Route path="/404" element={<NotFound />} />

            {/* Catch-all redirect to 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
