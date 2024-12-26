export const isValidRedditUrl = (url) => {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    const validDomains = [
      "reddit.com",
      "www.reddit.com",
      "reddit-now.com",
      "www.reddit-now.com",
      "localhost",
    ];

    // Check domain
    if (!validDomains.includes(urlObj.hostname)) {
      return false;
    }

    // Validate path structure
    const pathRegex = /^\/r\/[\w-]+\/comments\/[\w\d]+(?:\/[\w-]*)?$/;
    return pathRegex.test(urlObj.pathname);
  } catch {
    return false;
  }
};

export const parseRedditUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const [, , subreddit, , threadId, title] = urlObj.pathname.split("/");

    return {
      subreddit,
      threadId,
      title: title || "",
      isValid: Boolean(subreddit && threadId),
      originalUrl: `https://www.reddit.com/r/${subreddit}/comments/${threadId}${title ? `/${title}` : ""}`,
    };
  } catch {
    return { isValid: false };
  }
};
