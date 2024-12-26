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
      depth: "5",
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
    ids.add(comment.id);
    comment.replies?.forEach(traverse);
  }
  comments.forEach(traverse);
  return ids;
}

function processComment(comment, existingIds) {
  let content = comment.body;

  // Process GIFs in media metadata
  if (comment.media_metadata) {
    Object.entries(comment.media_metadata).forEach(([key, value]) => {
      if (value.e === "AnimatedImage" && value.s?.gif) {
        content = content.replace(`![gif](${key})`, `![gif](${value.s.gif})`);
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
    isNew: !existingIds.has(comment.id),
    replies: [],
  };
}

function parseComments(children, existingIds) {
  return children
    .filter((child) => child.kind === "t1")
    .map((child) => {
      const comment = processComment(child.data, existingIds);
      if (child.data.replies?.data?.children) {
        comment.replies = parseComments(
          child.data.replies.data.children,
          existingIds,
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

      const existingIds = collectExistingCommentIds(commentsRef.current);
      const newComments = parseComments(data[1].data.children, existingIds);

      setComments((prevComments) => {
        const mergedComments = [...newComments, ...prevComments]
          .reduce((acc, comment) => {
            const existingIndex = acc.findIndex((c) => c.id === comment.id);
            if (existingIndex === -1) {
              acc.push(comment);
            } else {
              acc[existingIndex] = {
                ...comment,
                isNew: acc[existingIndex].isNew,
              };
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
            replies: comment.replies.map((reply) => ({
              ...reply,
              isNew: false,
            })),
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
  }, [url]);

  return { comments, error, isLoading, lastFetch, fetchComments };
}
