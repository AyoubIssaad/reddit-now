// src/hooks/useTitleNotifications.js
import { useState, useEffect, useCallback, useRef } from "react";

export function useTitleNotifications(defaultTitle) {
  const [newCount, setNewCount] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [originalTitle] = useState(defaultTitle || document.title);

  // Use a ref to track the latest count across refreshes
  const countRef = useRef(0);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      const newVisibilityState = !document.hidden;
      setIsPageVisible(newVisibilityState);

      if (newVisibilityState) {
        // Reset count and title when page becomes visible
        setNewCount(0);
        countRef.current = 0;
        document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Reset title on unmount
      document.title = originalTitle;
    };
  }, [originalTitle]);

  // Update title when count changes and page is not visible
  useEffect(() => {
    if (!isPageVisible && newCount > 0) {
      document.title = `(${newCount}) ${originalTitle}`;
    }
  }, [newCount, isPageVisible, originalTitle]);

  // Function to increment the counter
  const incrementCount = useCallback(
    (count = 1) => {
      if (!isPageVisible) {
        countRef.current += count;
        setNewCount(countRef.current);
      }
    },
    [isPageVisible],
  );

  // Function to reset the counter and title
  const resetCount = useCallback(() => {
    setNewCount(0);
    countRef.current = 0;
    document.title = originalTitle;
  }, [originalTitle]);

  return {
    newCount,
    isPageVisible,
    incrementCount,
    resetCount,
  };
}
