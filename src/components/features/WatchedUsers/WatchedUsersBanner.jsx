// src/components/features/WatchedUsers/WatchedUsersBanner.jsx
import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Bell, ChevronDown, ChevronRight, X } from "lucide-react";

const WatchedUsersBanner = ({
  watchedUsers,
  comments = [],
  newActivityByUser,
  onWatchUser,
  onUnwatchUser,
  onClearActivity,
  notificationsEnabled,
  onRequestNotifications,
  onNavigateToComment,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newUsername, setNewUsername] = useState("");

  // Find the latest comment for each watched user
  const latestCommentsByUser = useMemo(() => {
    const result = {};

    const processComment = (comment) => {
      if (watchedUsers.includes(comment.author)) {
        // Only track if it's a new comment
        if (comment.isNew) {
          if (
            !result[comment.author] ||
            comment.created > result[comment.author].created
          ) {
            result[comment.author] = comment;
          }
        }
      }
      // Process replies recursively
      comment.replies?.forEach(processComment);
    };

    comments.forEach(processComment);
    return result;
  }, [comments, watchedUsers]);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUsername.trim()) {
      onWatchUser(newUsername.trim());
      setNewUsername("");
    }
  };

  const handleUserClick = (username) => {
    const latestComment = latestCommentsByUser[username];
    if (latestComment) {
      onNavigateToComment(latestComment.id);
    }
  };

  if (watchedUsers.length === 0 && !isExpanded) return null;

  return (
    <Card className="mb-4 border-primary/20">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium hover:text-primary"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Watched Users ({watchedUsers.length})
          </button>
          {!notificationsEnabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRequestNotifications}
              className="text-sm"
            >
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Add User Form */}
          <form onSubmit={handleAddUser} className="flex gap-2">
            <Input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter Reddit username"
              className="flex-1"
            />
            <Button type="submit" disabled={!newUsername.trim()}>
              Watch User
            </Button>
          </form>

          {/* Watched Users List */}
          <div className="space-y-2">
            {watchedUsers.map((username) => (
              <div
                key={username}
                className="flex items-center justify-between bg-muted/30 rounded-lg p-2"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUserClick(username)}
                    className={`font-medium hover:underline ${
                      latestCommentsByUser[username]
                        ? "cursor-pointer"
                        : "cursor-default"
                    }`}
                    disabled={!latestCommentsByUser[username]}
                  >
                    u/{username}
                  </button>
                  {newActivityByUser[username] && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {newActivityByUser[username]} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {newActivityByUser[username] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onClearActivity(username)}
                      className="text-xs"
                    >
                      Clear
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onUnwatchUser(username)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default WatchedUsersBanner;
