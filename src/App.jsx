// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/layout/Header";
import Container from "./components/layout/Container";
import ThreadViewer from "./components/features/ThreadViewer/ThreadViewer";
import RedditRoute from "./components/features/RedditRoute/RedditRoute";
import SEO from "./components/SEO";

// Homepage component with improved design
const Home = () => (
  <Container>
    <SEO
      title="Reddit-Now - Watch Reddit Threads Live"
      description="Follow Reddit discussions in real-time without refreshing. Just paste a thread URL and start watching the conversation unfold live."
      canonicalUrl="https://reddit-now.com"
    />
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="flex items-center gap-3 text-heading2">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
            Live Reddit Experience
          </h2>
          <p className="text-body-large text-muted-foreground max-w-2xl">
            Never miss a moment of the conversation! Follow discussions in
            real-time without refreshing.
          </p>
        </div>

        {/* Steps Section */}
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              1
            </div>
            <div className="text-body text-muted-foreground">
              Paste any Reddit thread URL in the box below
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              2
            </div>
            <div className="text-body text-muted-foreground">
              Or simply replace{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                reddit.com
              </code>{" "}
              with{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                reddit-now.com
              </code>{" "}
              in any Reddit URL
            </div>
          </div>
        </div>
      </div>

      {/* Thread Viewer Section */}
      <div className="mt-8">
        <ThreadViewer hideHeader={true} />
      </div>

      {/* Features Section */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-heading4">Real-time Updates</h3>
          <p className="text-body text-muted-foreground">
            Watch comments appear instantly with automatic refresh intervals of
            your choosing
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-heading4">No Account Needed</h3>
          <p className="text-body text-muted-foreground">
            Start following discussions immediately without signing up
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-heading4">Dark Mode Support</h3>
          <p className="text-body text-muted-foreground">
            Easy on the eyes with automatic dark mode detection
          </p>
        </div>
      </div>
    </div>
  </Container>
);

// 404 Page Component with improved design
const NotFound = () => (
  <Container>
    <SEO
      title="404 - Page Not Found | Reddit-Now"
      description="The page you're looking for doesn't exist. Try pasting a Reddit thread URL to start watching comments in real-time."
      robotsContent="noindex, follow"
    />
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-heading1 mb-4">404 - Page Not Found</h1>
      <p className="text-body-large text-muted-foreground mb-8 max-w-md">
        The page you're looking for doesn't exist. Head back home to start
        watching Reddit threads.
      </p>
      <a href="/" className="button-primary">
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
