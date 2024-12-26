import React from "react";
import Comment from "./Comment";

const CommentList = ({ comments = [], expandByDefault = false }) => {
  if (!comments.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No comments yet. Start watching to see new comments appear in real-time.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          expandByDefault={expandByDefault}
        />
      ))}
    </div>
  );
};

export default CommentList;
