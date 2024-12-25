import { useState, useCallback } from "react";
import { convertToJsonUrl, isValidRedditUrl } from "../utils/reddit";

const parseComments = (children) => {
  return children
    .map((child) => ({
      id: child.data.id,
      author: child.data.author,
      content: child.data.body,
      score: child.data.score,
      created: child.data.created_utc,
      isNew: true,
      replies: child.data.replies?.data?.children
        ? parseComments(
            child.data.replies.data.children.filter((c) => c.kind === "t1"),
          )
        : [],
    }))
    .sort((a, b) => b.created - a.created); // Sort by newest first within each level
};

export const useRedditThread = (url) => {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!url || !isValidRedditUrl(url)) {
      setError("Please enter a valid Reddit thread URL");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const jsonUrl = convertToJsonUrl(url);
      const response = await fetch(jsonUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      const newComments = parseComments(
        data[1].data.children.filter((c) => c.kind === "t1"),
      );

      setComments((prevComments) => {
        // Create a map of existing comments for efficient lookup
        const existingCommentMap = new Map(
          prevComments.map((comment) => [comment.id, comment]),
        );

        // Filter out comments we already have and mark new ones
        const uniqueNewComments = newComments.filter((comment) => {
          const exists = existingCommentMap.has(comment.id);
          if (!exists) {
            return true;
          }
          // Update the isNew flag for existing comments
          comment.isNew = false;
          return false;
        });

        // Combine new and existing comments, sort by creation time
        const allComments = [...uniqueNewComments, ...prevComments].sort(
          (a, b) => b.created - a.created,
        );

        return allComments;
      });

      setLastFetch(new Date());
    } catch (err) {
      setError("Error fetching comments. Please check the URL and try again.");
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
};
