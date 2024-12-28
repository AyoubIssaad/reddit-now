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
  const [isExpanded, setIsExpanded] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  // Find the latest comment for each watched user
  const latestCommentsByUser = useMemo(() => {
    const result = {};
    const processComment = (comment) => {
      if (watchedUsers.includes(comment.author)) {
        // Track all comments
        if (
          !result[comment.author] ||
          comment.created > result[comment.author].created
        ) {
          result[comment.author] = comment;
        }
      }

      // Process replies recursively
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach(processComment);
      }
    };

    // Process all comments
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
    console.log("Clicked user:", username); // Debug log
    console.log("Latest comments:", latestCommentsByUser); // Debug log
    console.log("New activity:", newActivityByUser); // Debug log

    const latestComment = latestCommentsByUser[username];
    console.log("Latest comment for user:", latestComment); // Debug log

    if (latestComment) {
      console.log("Navigating to comment:", latestComment.id); // Debug log
      onNavigateToComment(latestComment.id);
      if (newActivityByUser[username]) {
        onClearActivity(username);
      }
    }
  };

  return (
    <Card className="mb-4 border-primary/20">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
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
        <div className="p-3 space-y-3">
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

          {/* Watched Users Layout */}
          <div className="flex flex-wrap gap-2">
            {watchedUsers.map((username) => {
              const hasActivity = !!newActivityByUser[username];
              const latestComment = latestCommentsByUser[username];

              return (
                <div
                  key={username}
                  className="inline-flex items-center gap-2 bg-muted rounded-lg p-2"
                >
                  <button
                    onClick={() => handleUserClick(username)}
                    className={`flex items-center gap-2 ${
                      hasActivity ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span
                      className={`font-medium whitespace-nowrap ${
                        hasActivity
                          ? "text-primary hover:text-primary/80"
                          : "text-muted-foreground"
                      }`}
                      title={
                        hasActivity
                          ? "Click to see latest comment"
                          : "No new comments"
                      }
                    >
                      u/{username}
                    </span>
                    {hasActivity && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {newActivityByUser[username]} new
                      </span>
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onUnwatchUser(username)}
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default WatchedUsersBanner;
