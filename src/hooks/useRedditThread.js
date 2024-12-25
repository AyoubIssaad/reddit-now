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
    .sort((a, b) => b.created - a.created);
};

export const useRedditThread = (url) => {
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

      // Extract thread info from URL
      const jsonUrl = convertToJsonUrl(url);

      const response = await fetch(jsonUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Verify we have the comments array
      if (!data[1]?.data?.children) {
        throw new Error("Invalid response format from Reddit");
      }

      const newComments = parseComments(
        data[1].data.children.filter((c) => c.kind === "t1"),
      );

      setComments((prevComments) => {
        const existingCommentMap = new Map(
          prevComments.map((comment) => [comment.id, comment]),
        );

        const uniqueNewComments = newComments.filter((comment) => {
          const exists = existingCommentMap.has(comment.id);
          if (!exists) {
            return true;
          }
          comment.isNew = false;
          return false;
        });

        const allComments = [...uniqueNewComments, ...prevComments].sort(
          (a, b) => b.created - a.created,
        );

        return allComments;
      });

      setLastFetch(new Date());
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Error fetching comments. ${err.message}`);
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
