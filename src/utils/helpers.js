/**
 * Formats a timestamp into a human-readable string showing how long ago it was
 * @param {Date|string} timestamp - The timestamp to format
 * @returns {string} Formatted time string (e.g., "2m ago", "3h ago", "2d ago", or the date if older)
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  
  // If older than a week, return the date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Extracts hashtags from a string
 * @param {string} content - The content to extract hashtags from
 * @returns {string[]} Array of hashtags without the # symbol
 */
export const extractTags = (content) => {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  const matches = content.match(hashtagRegex) || [];
  return matches.map(tag => tag.slice(1).toLowerCase());
}; 