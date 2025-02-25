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
      limit: "100",
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

  function mergeComment(comment, isFromNewSet = false) {
    const existing = mergedMap.get(comment.id);

    if (existing) {
      const existingReplies = new Map(
        existing.replies.map((reply) => [reply.id, reply]),
      );

      const mergedReplies = comment.replies.map((newReply) => {
        const existingReply = existingReplies.get(newReply.id);
        if (existingReply) {
          return {
            ...existingReply,
            ...newReply,
            isNew: existingReply.isNew || newReply.isNew,
            replies: mergeComment(newReply, isFromNewSet).replies,
          };
        }
        return {
          ...newReply,
          isNew: true,
        };
      });

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
      const processedReplies = comment.replies.map((reply) =>
        mergeComment(reply, isFromNewSet),
      );

      const newComment = {
        ...comment,
        isNew: isFromNewSet,
        replies: processedReplies.sort((a, b) => b.created - a.created),
      };

      mergedMap.set(comment.id, newComment);
      return newComment;
    }
  }

  oldComments.forEach((comment) => mergeComment(comment, false));
  newComments.forEach((comment) => mergeComment(comment, true));

  return Array.from(mergedMap.values()).sort((a, b) => b.created - a.created);
}

export function useRedditThread(url) {
  const [comments, setComments] = useState([]);
  const [threadData, setThreadData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [commentStats, setCommentStats] = useState({
    displayedCount: 0,
    totalCount: 0,
  });

  const commentsRef = useRef([]);
  const timeoutRef = useRef();
  const processedCommentsRef = useRef(new Set());

  commentsRef.current = comments;

  const resetNewFlags = useCallback(() => {
    setComments((current) => {
      function resetFlags(comments) {
        return comments.map((comment) => ({
          ...comment,
          isNew: false,
          replies: resetFlags(comment.replies),
        }));
      }
      return resetFlags(current);
    });
  }, []);

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
        if (response.status === 404) {
          throw new Error(
            "Thread not found. It might have been deleted or made private.",
          );
        }
        throw new Error("Failed to fetch thread information");
      }

      const data = await response.json();

      // Extract thread info
      const threadInfo = data[0]?.data?.children?.[0]?.data;
      if (threadInfo) {
        setThreadData(threadInfo);
        setCommentStats((prev) => ({
          ...prev,
          totalCount: threadInfo.num_comments || 0,
        }));
      }

      const existingCommentMap = buildCommentMap(commentsRef.current);
      const newComments = parseComments(
        data[1]?.data?.children || [],
        existingCommentMap,
      );

      let newCommentsCount = 0;
      const countNewComments = (comments) => {
        for (const comment of comments) {
          if (!processedCommentsRef.current.has(comment.id)) {
            newCommentsCount++;
            processedCommentsRef.current.add(comment.id);
          }
          if (comment.replies) {
            countNewComments(comment.replies);
          }
        }
      };
      countNewComments(newComments);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setComments((prevComments) => {
        const mergedComments = mergeComments(prevComments, newComments);
        setCommentStats((prev) => ({
          ...prev,
          displayedCount: mergedComments.length,
        }));
        return mergedComments;
      });

      timeoutRef.current = setTimeout(resetNewFlags, 8000);
      setLastFetch(new Date());

      return {
        newCommentsCount,
        comments: newComments, // Return the new comments for processing
      };
    } catch (err) {
      setError(err.message);
      console.error("Error fetching thread:", err);
      return { newCommentsCount: 0, comments: [] };
    } finally {
      setIsLoading(false);
    }
  }, [url, resetNewFlags]);

  useEffect(() => {
    processedCommentsRef.current = new Set();
    setComments([]);
    setThreadData(null);
    setError("");
    setLastFetch(null);
    setCommentStats({
      displayedCount: 0,
      totalCount: 0,
    });
  }, [url]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [url]);

  return {
    comments,
    error,
    isLoading,
    lastFetch,
    fetchComments,
    threadData,
    commentStats,
  };
}
