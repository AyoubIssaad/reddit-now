export const isValidRedditUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "www.reddit.com" || urlObj.hostname === "reddit.com"
    );
  } catch {
    return false;
  }
};

export const convertToJsonUrl = (redditUrl) => {
  // Remove trailing slash if present
  const cleanUrl = redditUrl.replace(/\/$/, "");
  // Add .json to the end
  return `${cleanUrl}.json`;
};

export const extractThreadInfo = (url) => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/");
    return {
      subreddit: parts[2],
      threadId: parts[4],
      isValid: parts.length >= 6 && parts[1] === "r" && parts[3] === "comments",
    };
  } catch {
    return { isValid: false };
  }
};
