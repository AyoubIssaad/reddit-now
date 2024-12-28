import { useState, useEffect, useCallback } from "react";

export function usePinnedComments(threadId) {
  // Initialize state from localStorage
  const [pinnedCommentIds, setPinnedCommentIds] = useState(() => {
    const stored = localStorage.getItem(`pinned-comments-${threadId}`);
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage whenever pins change
  useEffect(() => {
    localStorage.setItem(
      `pinned-comments-${threadId}`,
      JSON.stringify(pinnedCommentIds),
    );
  }, [pinnedCommentIds, threadId]);

  // Pin a comment
  const pinComment = useCallback((commentId) => {
    setPinnedCommentIds((prev) => [...prev, commentId]);
  }, []);

  // Unpin a comment
  const unpinComment = useCallback((commentId) => {
    setPinnedCommentIds((prev) => prev.filter((id) => id !== commentId));
  }, []);

  // Clear all pins
  const clearPins = useCallback(() => {
    setPinnedCommentIds([]);
  }, []);

  // Check if a comment is pinned
  const isPinned = useCallback(
    (commentId) => {
      return pinnedCommentIds.includes(commentId);
    },
    [pinnedCommentIds],
  );

  return {
    pinnedCommentIds,
    pinComment,
    unpinComment,
    clearPins,
    isPinned,
  };
}
