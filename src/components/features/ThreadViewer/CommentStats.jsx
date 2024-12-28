import React from "react";

const CommentStats = ({ displayedCount, totalCount }) => {
  if (!totalCount) return null;

  return (
    <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 mb-4">
      <p>
        Showing the latest {displayedCount} of {totalCount.toLocaleString()}{" "}
        total comments
      </p>
    </div>
  );
};

export default CommentStats;
