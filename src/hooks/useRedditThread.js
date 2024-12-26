// src/hooks/useRedditThread.js
import { useState, useCallback, useRef } from "react";

// Utility to convert a regular Reddit URL to its JSON endpoint
function convertToJsonUrl(url) {
  try {
    const urlObj = new URL(url);
    let apiUrl = url;

    // Handle different URL formats
    if (
      urlObj.hostname === "reddit.com" ||
      urlObj.hostname === "www.reddit.com"
    ) {
      apiUrl = `https://www.reddit.com${urlObj.pathname}`;
    } else if (urlObj.pathname.startsWith("/r/")) {
      apiUrl = `https://www.reddit.com${urlObj.pathname}`;
    } else {
      return null;
    }

    // Ensure proper JSON endpoint with optimized parameters
    const baseUrl = `${apiUrl.replace(/\/$/, "")}.json`;
    const params = new URLSearchParams({
      sort: "new", // Get newest comments first
      limit: "200", // Fetch up to 200 comments
      depth: "5", // Limit comment tree depth to 5 levels
      raw_json: "1", // Get raw JSON (better handling of special characters)
    });
    return `${baseUrl}?${params.toString()}`;
  } catch {
    return null;
  }
}

// Process comments recursively
function processComment(comment, existingComments = new Map()) {
  let content = comment.body;

  // Process GIFs in media metadata
  if (comment.media_metadata) {
    Object.entries(comment.media_metadata).forEach(([key, value]) => {
      if (value.e === "AnimatedImage" && value.s?.gif) {
        content = content.replace(`![gif](${key})`, `![gif](${value.s.gif})`);
      }
    });
  }

  const existingComment = existingComments.get(comment.id);
  const isNew = !existingComment;

  return {
    id: comment.id,
    author: comment.author,
    content,
    score: comment.score,
    created: comment.created_utc,
    permalink: comment.permalink,
    isNew,
    replies: [],
  };
}

function parseComments(children, existingComments = new Map()) {
  return children
    .filter((child) => child.kind === "t1")
    .map((child) => {
      const comment = processComment(child.data, existingComments);

      // Process replies recursively
      if (child.data.replies?.data?.children) {
        comment.replies = parseComments(
          child.data.replies.data.children,
          existingComments,
        );
      }

      return comment;
    })
    .sort((a, b) => b.created - a.created);
}

export function useRedditThread(url) {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const commentsRef = useRef(comments);

  // Update ref when comments change
  commentsRef.current = comments;

  const fetchComments = useCallback(async () => {
    if (!url) {
      setError("Please enter a valid Reddit thread URL");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const jsonUrl = convertToJsonUrl(url);
      if (!jsonUrl) {
        throw new Error("Invalid Reddit URL");
      }

      const response = await fetch(jsonUrl, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comments (${response.status})`);
      }

      const data = await response.json();
      if (!data[1]?.data?.children) {
        throw new Error("Invalid response format from Reddit");
      }

      // Create a Map of existing comments for faster lookups
      const existingComments = new Map(
        commentsRef.current.map((comment) => [comment.id, comment]),
      );

      // Parse new comments
      const newComments = parseComments(
        data[1].data.children,
        existingComments,
      );

      // Update comments state
      setComments((prevComments) => {
        const mergedComments = [...newComments, ...prevComments]
          .reduce((acc, comment) => {
            const existingIndex = acc.findIndex((c) => c.id === comment.id);
            if (existingIndex === -1) {
              // New comment, add it
              acc.push(comment);
            } else {
              // Update existing comment but preserve isNew flag
              const updatedComment = {
                ...comment,
                isNew: acc[existingIndex].isNew,
              };
              acc[existingIndex] = updatedComment;
            }
            return acc;
          }, [])
          .sort((a, b) => b.created - a.created);

        return mergedComments;
      });

      // Reset new flags after 3 seconds
      setTimeout(() => {
        setComments((prev) =>
          prev.map((comment) => ({
            ...comment,
            isNew: false,
          })),
        );
      }, 3000);

      setLastFetch(new Date());
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [url]); // Only depend on url, use ref for comments

  return {
    comments,
    error,
    isLoading,
    lastFetch,
    fetchComments,
  };
}
