import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import Header from "./components/layout/Header";
import Container from "./components/layout/Container";
import ThreadViewer from "./components/features/ThreadViewer/ThreadViewer";

// Handle Reddit-style routes
const RedditRoute = () => {
  const { subreddit, id, title } = useParams();
  const redditUrl = `https://reddit.com/r/${subreddit}/comments/${id}/${title || ""}`;
  return (
    <Container>
      <ThreadViewer initialUrl={redditUrl} autoStart={true} />
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

          {/* Handle exact Reddit URL patterns */}
          <Route path="/r/:subreddit/comments/:id" element={<RedditRoute />} />
          <Route
            path="/r/:subreddit/comments/:id/:title"
            element={<RedditRoute />}
          />

          {/* Handle any extra slashes or params */}
          <Route
            path="/r/:subreddit/comments/:id/*"
            element={<RedditRoute />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
