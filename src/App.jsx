// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/layout/Header";
import Container from "./components/layout/Container";
import ThreadViewer from "./components/features/ThreadViewer/ThreadViewer";
import RedditRoute from "./components/features/RedditRoute/RedditRoute";
import SEO from "./components/SEO";

const Home = () => (
  <Container>
    <SEO
      title="Reddit-Now - Watch Reddit Threads Live"
      description="Follow Reddit discussions in real-time without refreshing. Just paste a thread URL and start watching the conversation unfold live."
      canonicalUrl="https://reddit-now.com"
    />
    <ThreadViewer />
  </Container>
);

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

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
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
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
