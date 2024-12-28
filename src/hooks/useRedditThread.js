// src/hooks/useRedditThread.js
import { useState, useEffect, useCallback, useRef } from "react";

function convertToJsonUrl(url) {
  try {
    const urlObj = new URL(url);
    let apiUrl;

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

    const baseUrl = `${apiUrl.replace(/\/$/, "")}.json`;
    const params = new URLSearchParams({
      sort: "new",
      limit: "500",
      raw_json: "1",
    });
    return `${baseUrl}?${params.toString()}`;
  } catch {
    return null;
  }
}

function buildCommentMap(comments) {
  const map = new Map();

  function addToMap(comment) {
    if (!comment) return;
    map.set(comment.id, comment);
    if (comment.replies) {
      comment.replies.forEach(addToMap);
    }
  }

  comments.forEach(addToMap);
  return map;
}

function processComment(comment, existingCommentMap = new Map()) {
  if (!comment?.id) return null;

  let content = comment.body || "";

  // Process GIFs in media metadata
  if (comment.media_metadata) {
    Object.entries(comment.media_metadata).forEach(([key, value]) => {
      if (value.e === "AnimatedImage" && value.s?.gif) {
        content = content.replace(`![gif](${key})`, `![gif](${value.s.gif})`);
      }
    });
  }

  const existingComment = existingCommentMap.get(comment.id);
  const isNew = !existingComment;

  return {
    id: comment.id,
    author: comment.author || "[deleted]",
    content,
    score: typeof comment.score === "number" ? comment.score : 0,
    created: comment.created_utc,
    permalink: comment.permalink,
    isNew,
    replies: [],
  };
}

function parseComments(children, existingCommentMap) {
  if (!Array.isArray(children)) return [];

  return children
    .filter((child) => child?.kind === "t1" && child?.data)
    .map((child) => {
      const comment = processComment(child.data, existingCommentMap);
      if (!comment) return null;

      // Process replies recursively
      if (child.data.replies?.data?.children) {
        comment.replies = parseComments(
          child.data.replies.data.children,
          existingCommentMap,
        );
      }

      return comment;
    })
    .filter(Boolean);
}

function mergeComments(oldComments, newComments) {
  const mergedMap = new Map();

  // Helper function to merge a comment and its replies
  function mergeComment(comment, isFromNewSet = false) {
    const existing = mergedMap.get(comment.id);

    if (existing) {
      // Keep track of existing replies
      const existingReplies = new Map(
        existing.replies.map((reply) => [reply.id, reply]),
      );

      // Process new replies
      const mergedReplies = comment.replies.map((newReply) => {
        const existingReply = existingReplies.get(newReply.id);
        if (existingReply) {
          // If reply exists, merge it recursively
          return {
            ...existingReply,
            ...newReply,
            isNew: existingReply.isNew || newReply.isNew,
            replies: mergeComment(newReply, isFromNewSet).replies,
          };
        }
        // If reply is new, mark it as new
        return {
          ...newReply,
          isNew: true,
        };
      });

      // Add existing replies that weren't in the new set
      existing.replies.forEach((reply) => {
        if (!mergedReplies.some((r) => r.id === reply.id)) {
          mergedReplies.push(reply);
        }
      });

      const merged = {
        ...existing,
        ...comment,
        isNew: existing.isNew || (isFromNewSet && !existing),
        replies: mergedReplies.sort((a, b) => b.created - a.created),
      };

      mergedMap.set(comment.id, merged);
      return merged;
    } else {
      // Process replies for new comment
      const processedReplies = comment.replies.map((reply) => {
        return mergeComment(reply, isFromNewSet);
      });

      const newComment = {
        ...comment,
        isNew: isFromNewSet,
        replies: processedReplies.sort((a, b) => b.created - a.created),
      };

      mergedMap.set(comment.id, newComment);
      return newComment;
    }
  }

  // Process all old comments first
  oldComments.forEach((comment) => mergeComment(comment, false));

  // Then process new comments, potentially updating existing ones
  newComments.forEach((comment) => mergeComment(comment, true));

  // Convert map to array and sort
  return Array.from(mergedMap.values()).sort((a, b) => b.created - a.created);
}

export function useRedditThread(url) {
  const [comments, setComments] = useState([]);
  const [threadData, setThreadData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const commentsRef = useRef([]);

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

      // Extract thread info
      const threadInfo = data[0]?.data?.children?.[0]?.data;
      if (threadInfo) {
        setThreadData(threadInfo);
      }

      // Build map of existing comments
      const existingCommentMap = buildCommentMap(commentsRef.current);

      // Parse new comments
      const newComments = parseComments(
        data[1]?.data?.children || [],
        existingCommentMap,
      );

      // Merge old and new comments
      setComments((prevComments) => mergeComments(prevComments, newComments));

      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
      console.error("Error fetching thread:", err);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  // Reset comments when URL changes
  useEffect(() => {
    setComments([]);
    setThreadData(null);
    setError("");
    setLastFetch(null);
  }, [url]);

  return {
    comments,
    error,
    isLoading,
    lastFetch,
    fetchComments,
    threadData,
  };
}
