// src/hooks/useTitleNotifications.js
import { useState, useEffect, useCallback, useRef } from "react";

export function useTitleNotifications(defaultTitle) {
  const [newCount, setNewCount] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [originalTitle] = useState(defaultTitle || document.title);
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

    // Initialize visibility state
    setIsPageVisible(!document.hidden);

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
    } else if (isPageVisible) {
      document.title = originalTitle;
    }
  }, [newCount, isPageVisible, originalTitle]);

  // Function to increment the counter
  const incrementCount = useCallback(
    (count = 1) => {
      if (!isPageVisible) {
        const newValue = countRef.current + count;
        countRef.current = newValue;
        setNewCount(newValue);
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

  // Update title when defaultTitle changes
  useEffect(() => {
    if (defaultTitle !== originalTitle) {
      document.title = defaultTitle;
    }
  }, [defaultTitle, originalTitle]);

  return {
    newCount,
    isPageVisible,
    incrementCount,
    resetCount,
  };
}
