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
  const { subreddit, id } = useParams();
  const redditUrl = `https://reddit.com/r/${subreddit}/comments/${id}`;
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
          <Route
            path="/r/:subreddit/comments/:id/*"
            element={<RedditRoute />}
          />
          {/* Handle old reddit URLs */}
          <Route
            path="/www.reddit.com/*"
            element={
              <Navigate to={`/${window.location.pathname.slice(15)}`} replace />
            }
          />
          <Route
            path="/reddit.com/*"
            element={
              <Navigate to={`/${window.location.pathname.slice(11)}`} replace />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
