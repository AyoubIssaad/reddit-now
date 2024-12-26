import { useState, useCallback } from "react";

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

    // Ensure proper JSON endpoint
    return `${apiUrl.replace(/\/$/, "")}.json`;
  } catch {
    return null;
  }
}

// Process comments recursively
function parseComments(children) {
  return children
    .filter((child) => child.kind === "t1")
    .map((child) => {
      const comment = child.data;
      let content = comment.body;

      // Process GIFs in media metadata
      if (comment.media_metadata) {
        Object.entries(comment.media_metadata).forEach(([key, value]) => {
          if (value.e === "AnimatedImage" && value.s?.gif) {
            content = content.replace(
              `![gif](${key})`,
              `![gif](${value.s.gif})`,
            );
          }
        });
      }

      return {
        id: comment.id,
        author: comment.author,
        content,
        score: comment.score,
        created: comment.created_utc,
        permalink: comment.permalink,
        isNew: true,
        replies: comment.replies?.data?.children
          ? parseComments(comment.replies.data.children)
          : [],
      };
    })
    .sort((a, b) => b.created - a.created);
}

export function useRedditThread(url) {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

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

      const newComments = parseComments(data[1].data.children);

      // Merge new comments with existing ones
      setComments((prevComments) => {
        const existingIds = new Set(prevComments.map((comment) => comment.id));

        // Filter out duplicates and mark non-new comments
        const uniqueNewComments = newComments.filter((comment) => {
          const exists = existingIds.has(comment.id);
          if (exists) {
            comment.isNew = false;
          }
          return !exists;
        });

        // Sort by creation time
        return [...uniqueNewComments, ...prevComments].sort(
          (a, b) => b.created - a.created,
        );
      });

      setLastFetch(new Date());
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  return {
    comments,
    error,
    isLoading,
    lastFetch,
    fetchComments,
  };
}
