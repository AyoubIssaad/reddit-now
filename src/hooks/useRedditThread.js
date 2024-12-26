import { useState, useCallback, useRef } from "react";

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
      limit: "200",
      raw_json: "1",
    });
    return `${baseUrl}?${params.toString()}`;
  } catch {
    return null;
  }
}

function collectExistingCommentIds(comments) {
  const ids = new Set();
  function traverse(comment) {
    if (!comment) return;
    ids.add(comment.id);
    comment.replies?.forEach(traverse);
  }
  comments.forEach(traverse);
  return ids;
}

function processComment(comment, existingIds) {
  if (!comment?.id) return null;

  return {
    id: comment.id,
    author: comment.author || "[deleted]",
    content: comment.body || "",
    score: typeof comment.score === "number" ? comment.score : 0,
    created: comment.created_utc,
    permalink: comment.permalink,
    isNew: !existingIds.has(comment.id),
    replies: [],
  };
}

function parseComments(children, existingIds) {
  if (!Array.isArray(children)) return [];

  return children
    .filter((child) => child?.kind === "t1" && child?.data)
    .map((child) => {
      const comment = processComment(child.data, existingIds);
      if (!comment) return null;

      if (child.data.replies?.data?.children) {
        comment.replies = parseComments(
          child.data.replies.data.children,
          existingIds,
        );
      }
      return comment;
    })
    .filter(Boolean)
    .sort((a, b) => b.created - a.created);
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

      // Process comments
      const existingIds = collectExistingCommentIds(commentsRef.current);
      const newComments = parseComments(
        data[1]?.data?.children || [],
        existingIds,
      );

      setComments((prevComments) => {
        const existingCommentsMap = new Map(
          prevComments.map((comment) => [
            comment.id,
            { ...comment, isNew: false },
          ]),
        );

        newComments.forEach((newComment) => {
          if (!existingCommentsMap.has(newComment.id)) {
            existingCommentsMap.set(newComment.id, {
              ...newComment,
              isNew: true,
            });
          }
        });

        return Array.from(existingCommentsMap.values()).sort(
          (a, b) => b.created - a.created,
        );
      });

      // Reset new flags after animation
      setTimeout(() => {
        setComments((prev) =>
          prev.map((comment) => ({
            ...comment,
            isNew: false,
            replies: comment.replies.map((reply) => ({
              ...reply,
              isNew: false,
            })),
          })),
        );
      }, 3000);

      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  return { comments, error, isLoading, lastFetch, fetchComments, threadData };
}
