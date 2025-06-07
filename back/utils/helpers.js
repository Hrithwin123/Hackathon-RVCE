export const extractTags = (content) => {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  const matches = content.match(hashtagRegex) || [];
  return matches.map(tag => tag.slice(1).toLowerCase()); // Remove # and convert to lowercase
};

export const formatTimestamp = (timestamp) => {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}; 