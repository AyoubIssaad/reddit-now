// src/hooks/useWatchedUsers.js
import { useState, useEffect, useCallback } from "react";

export function useWatchedUsers() {
  // Initialize state from localStorage
  const [watchedUsers, setWatchedUsers] = useState(() => {
    const stored = localStorage.getItem("watched-users");
    return stored ? JSON.parse(stored) : [];
  });

  // Track new comments from watched users
  const [newActivityByUser, setNewActivityByUser] = useState({});

  // Store notification permission status
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => Notification.permission === "granted",
  );

  // Save to localStorage whenever the watch list changes
  useEffect(() => {
    localStorage.setItem("watched-users", JSON.stringify(watchedUsers));
  }, [watchedUsers]);

  // Request notification permissions
  const requestNotifications = useCallback(async () => {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
      return permission === "granted";
    }
    return notificationsEnabled;
  }, [notificationsEnabled]);

  // Add a user to watch list
  const watchUser = useCallback((username) => {
    setWatchedUsers((prev) => {
      if (prev.includes(username)) return prev;
      return [...prev, username];
    });
  }, []);

  // Remove a user from watch list
  const unwatchUser = useCallback((username) => {
    setWatchedUsers((prev) => prev.filter((u) => u !== username));
    setNewActivityByUser((prev) => {
      const updated = { ...prev };
      delete updated[username];
      return updated;
    });
  }, []);

  // Check if a user is being watched
  const isWatched = useCallback(
    (username) => {
      return watchedUsers.includes(username);
    },
    [watchedUsers],
  );

  // Process new comments to track activity
  const processNewComments = useCallback(
    (comments) => {
      const newActivity = {};

      const checkComment = (comment) => {
        if (watchedUsers.includes(comment.author) && comment.isNew) {
          newActivity[comment.author] = (newActivity[comment.author] || 0) + 1;
        }
        comment.replies?.forEach(checkComment);
      };

      comments.forEach(checkComment);

      // Update activity counts
      setNewActivityByUser((prev) => {
        const updated = { ...prev };
        Object.entries(newActivity).forEach(([user, count]) => {
          updated[user] = (updated[user] || 0) + count;
        });
        return updated;
      });

      // Send notifications if enabled
      if (notificationsEnabled) {
        Object.entries(newActivity).forEach(([user, count]) => {
          new Notification(`New comment from ${user}`, {
            body: `${user} has posted ${count} new comment${count > 1 ? "s" : ""}`,
            icon: "/favicon-192x192.png",
          });
        });
      }

      return newActivity;
    },
    [watchedUsers, notificationsEnabled],
  );

  // Clear activity for a user
  const clearActivity = useCallback((username) => {
    setNewActivityByUser((prev) => {
      const updated = { ...prev };
      delete updated[username];
      return updated;
    });
  }, []);

  // Clear all activity
  const clearAllActivity = useCallback(() => {
    setNewActivityByUser({});
  }, []);

  return {
    watchedUsers,
    watchUser,
    unwatchUser,
    isWatched,
    processNewComments,
    newActivityByUser,
    clearActivity,
    clearAllActivity,
    notificationsEnabled,
    requestNotifications,
  };
}
