import React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Bell,
  BellOff,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/Alert";

export const WatchedUsersList = ({
  watchedUsers,
  newActivityByUser,
  onUnwatchUser,
  onClearActivity,
  notificationsEnabled,
  onRequestNotifications,
  isExpanded,
  onToggleExpand,
}) => {
  if (watchedUsers.length === 0) return null;

  return (
    <Card className="mb-4 border-primary/20">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <button
          onClick={onToggleExpand}
          className="flex items-center gap-2 text-sm font-medium hover:text-primary"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Watched Users ({watchedUsers.length})
        </button>

        {/* Notifications Toggle */}
        {!notificationsEnabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRequestNotifications}
            className="text-sm flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Enable Notifications
          </Button>
        )}
      </div>

      {/* Users List */}
      {isExpanded && (
        <div className="divide-y">
          {watchedUsers.map((username) => (
            <div
              key={username}
              className="p-3 hover:bg-muted/50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <a
                  href={`https://reddit.com/user/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                >
                  u/{username}
                </a>
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
                    size="icon"
                    onClick={() => onClearActivity(username)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <BellOff className="h-4 w-4" />
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
      )}
    </Card>
  );
};
