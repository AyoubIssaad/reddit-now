import React from "react";

const Container = ({ children }) => {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
};

export default Container;
