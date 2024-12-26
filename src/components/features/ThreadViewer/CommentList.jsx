import React from "react";
import Comment from "./Comment";

const CommentList = ({ comments, expandByDefault }) => {
  if (!comments.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No comments yet. Paste a Reddit thread URL and click "Start Watching" to
        begin.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment, index) => (
        <Comment
          key={comment.id}
          comment={comment}
          expandByDefault={expandByDefault}
          index={index}
        />
      ))}
    </div>
  );
};

export default CommentList;
