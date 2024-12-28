// src/components/features/WatchedUsers/WatchButton.jsx
import React from "react";
import { Button } from "@/components/ui/Button";
import { Eye } from "lucide-react";

const WatchButton = ({ username, isWatched, onToggleWatch }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.preventDefault();
        onToggleWatch(username);
      }}
      className={`h-8 w-8 transition-colors ${
        isWatched
          ? "text-primary hover:text-primary/80"
          : "text-muted-foreground hover:text-foreground"
      }`}
      title={isWatched ? `Unwatch ${username}` : `Watch ${username}`}
    >
      <Eye className={`h-4 w-4 ${isWatched ? "fill-current" : ""}`} />
    </Button>
  );
};

export default WatchButton;
