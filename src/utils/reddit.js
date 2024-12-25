export const isValidRedditUrl = (url) => {
  try {
    const urlObj = new URL(url);
    // Check if it's already a reddit URL
    if (
      urlObj.hostname === "www.reddit.com" ||
      urlObj.hostname === "reddit.com"
    ) {
      return true;
    }

    // Check if it's a valid reddit-style path on our domains
    const validPath = /^\/r\/[^\/]+\/comments\/[a-zA-Z0-9]+/.test(
      urlObj.pathname,
    );
    return (
      validPath &&
      (urlObj.hostname === "localhost" ||
        urlObj.hostname === "reddit-now.com" ||
        urlObj.hostname === "www.reddit-now.com")
    );
  } catch {
    return false;
  }
};

export const convertToJsonUrl = (redditUrl) => {
  try {
    const urlObj = new URL(redditUrl);

    // Always use www.reddit.com for API requests
    let apiUrl;
    if (
      urlObj.hostname === "reddit.com" ||
      urlObj.hostname === "www.reddit.com"
    ) {
      apiUrl = `https://www.reddit.com${urlObj.pathname}`;
    } else if (urlObj.pathname.startsWith("/r/")) {
      // For localhost or reddit-now.com, construct the www.reddit.com URL
      apiUrl = `https://www.reddit.com${urlObj.pathname}`;
    } else {
      throw new Error("Invalid Reddit URL format");
    }

    // Remove trailing slash and add .json
    return `${apiUrl.replace(/\/$/, "")}.json`;
  } catch (err) {
    console.error("URL conversion error:", err);
    return null;
  }
};

export const extractThreadInfo = (url) => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/");

    return {
      subreddit: parts[2],
      threadId: parts[4],
      title: parts[5] || "",
      isValid: parts.length >= 5 && parts[1] === "r" && parts[3] === "comments",
      originalUrl: `https://www.reddit.com${urlObj.pathname}`, // Updated to include www.
    };
  } catch {
    return { isValid: false };
  }
};
