// Replace the entire content of src/App.jsx with this:

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import Header from "./components/layout/Header";
import Container from "./components/layout/Container";
import ThreadViewer from "./components/features/ThreadViewer/ThreadViewer";

// Handle Reddit-style routes
const RedditRoute = () => {
  const { subreddit, id, title } = useParams();
  const location = useLocation();

  // Construct the corresponding Reddit URL
  const redditUrl = `https://reddit.com/r/${subreddit}/comments/${id}/${title || ""}`;

  return (
    <Container>
      <ThreadViewer
        initialUrl={redditUrl}
        autoStart={true}
        key={location.pathname} // Force remount on pathname change
      />
    </Container>
  );
};

// Handle the homepage
const Home = () => (
  <Container>
    <ThreadViewer />
  </Container>
);

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Handle all Reddit-style URL patterns */}
          <Route path="/r/:subreddit/comments/:id" element={<RedditRoute />} />
          <Route
            path="/r/:subreddit/comments/:id/:title"
            element={<RedditRoute />}
          />
          <Route
            path="/r/:subreddit/comments/:id/:title/"
            element={<RedditRoute />}
          />

          {/* Catch-all route for invalid paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
