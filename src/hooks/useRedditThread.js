// src/hooks/useRedditThread.js
import { useState, useCallback } from "react";
import { convertToJsonUrl } from "../utils/reddit";

const parseComments = (children) => {
  return children
    .map((child) => {
      const commentData = child.data;

      // Process comment body to handle GIFs
      let processedContent = commentData.body;

      // If there's media metadata and it contains GIFs, replace the markdown with the actual GIF URL
      if (commentData.media_metadata) {
        Object.entries(commentData.media_metadata).forEach(([key, value]) => {
          if (value.e === "AnimatedImage" && value.s?.gif) {
            // Replace the markdown pattern with the actual gif URL
            processedContent = processedContent.replace(
              `![gif](${key})`,
              `![gif](${value.s.gif})`,
            );
          }
        });
      }

      return {
        id: commentData.id,
        author: commentData.author,
        content: processedContent,
        score: commentData.score,
        created: commentData.created_utc,
        isNew: true,
        replies: commentData.replies?.data?.children
          ? parseComments(
              commentData.replies.data.children.filter((c) => c.kind === "t1"),
            )
          : [],
      };
    })
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

      const jsonUrl = convertToJsonUrl(url);
      if (!jsonUrl) {
        throw new Error("Invalid Reddit URL");
      }

      const response = await fetch(jsonUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

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
