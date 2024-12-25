import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import Header from "./components/layout/Header";
import Container from "./components/layout/Container";
import ThreadViewer from "./components/features/ThreadViewer/ThreadViewer";

// Handle Reddit-style routes
const RedditRoute = () => {
  const { subreddit, id } = useParams();
  const redditUrl = `https://reddit.com/r/${subreddit}/comments/${id}`;
  return (
    <Container>
      <ThreadViewer initialUrl={redditUrl} autoStart={true} />
    </Container>
  );
};

// Handle URLs with -now suffix
const RedditNowRoute = () => {
  const location = useLocation();
  const path = location.pathname;

  // Remove the -now suffix and extract the Reddit URL
  const redditPath = path.replace(/-now(\/.*)?$/, "");
  const redditUrl = `https://reddit.com${redditPath}`;

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
          {/* Handle direct Reddit paths */}
          <Route
            path="/r/:subreddit/comments/:id/*"
            element={<RedditRoute />}
          />

          {/* Handle paths with -now suffix */}
          <Route path="/*-now*" element={<RedditNowRoute />} />

          {/* Handle old reddit URLs */}
          <Route path="/www.reddit.com/*" element={<RedditNowRoute />} />
          <Route path="/reddit.com/*" element={<RedditNowRoute />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
