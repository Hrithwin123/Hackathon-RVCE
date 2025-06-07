const API_URL = 'http://localhost:5000/api/community';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const communityService = {
  // Post operations
  createPost: async (author, content) => {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, content })
    });
    return handleResponse(response);
  },

  // Get user details
  getUserDetails: async (userId) => {
    const response = await fetch(`${API_URL}/user/${userId}`);
    return handleResponse(response);
  },

  // Get posts with pagination
  getPosts: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({ page, limit });
    const response = await fetch(`${API_URL}/posts?${params}`);
    const data = await handleResponse(response);
    
    // Fetch author details for each post and its replies
    const postsWithAuthors = await Promise.all(
      data.posts.map(async (post) => {
        // Get post author details
        const authorDetails = await communityService.getUserDetails(post.author._id);
        
        // Get reply author details
        const repliesWithAuthors = await Promise.all(
          post.replies.map(async (reply) => {
            const replyAuthorDetails = await communityService.getUserDetails(reply.author._id);
            return {
              ...reply,
              author: {
                ...reply.author,
                name: replyAuthorDetails.name,
                username: replyAuthorDetails.username
              }
            };
          })
        );

        return {
          ...post,
          author: {
            ...post.author,
            name: authorDetails.name,
            username: authorDetails.username
          },
          replies: repliesWithAuthors
        };
      })
    );

    return {
      ...data,
      posts: postsWithAuthors
    };
  },

  addReply: async (postId, author, content) => {
    const response = await fetch(`${API_URL}/posts/${postId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, content })
    });
    return handleResponse(response);
  },

  togglePostLike: async (postId, userId) => {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return handleResponse(response);
  },

  toggleReplyLike: async (postId, replyId, userId) => {
    const response = await fetch(`${API_URL}/posts/${postId}/replies/${replyId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return handleResponse(response);
  },

  searchPosts: async (query) => {
    const response = await fetch(`${API_URL}/posts/search?query=${encodeURIComponent(query)}`);
    return handleResponse(response);
  }
}; 