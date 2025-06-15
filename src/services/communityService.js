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
        try {
          // Get post author details
          const authorDetails = post.author?._id ? 
            await communityService.getUserDetails(post.author._id) : 
            { name: 'Unknown User', username: 'unknown' };
          
          // Get reply author details
          const repliesWithAuthors = await Promise.all(
            (post.replies || []).map(async (reply) => {
              try {
                const replyAuthorDetails = reply.author?._id ? 
                  await communityService.getUserDetails(reply.author._id) : 
                  { name: 'Unknown User', username: 'unknown' };
                
                return {
                  ...reply,
                  author: {
                    _id: reply.author?._id || 'unknown',
                    name: replyAuthorDetails.name || 'Unknown User',
                    username: replyAuthorDetails.username || 'unknown'
                  }
                };
              } catch (error) {
                console.error('Error fetching reply author details:', error);
                return {
                  ...reply,
                  author: {
                    _id: reply.author?._id || 'unknown',
                    name: 'Unknown User',
                    username: 'unknown'
                  }
                };
              }
            })
          );

          return {
            ...post,
            author: {
              _id: post.author?._id || 'unknown',
              name: authorDetails.name || 'Unknown User',
              username: authorDetails.username || 'unknown'
            },
            replies: repliesWithAuthors
          };
        } catch (error) {
          console.error('Error fetching post author details:', error);
          return {
            ...post,
            author: {
              _id: post.author?._id || 'unknown',
              name: 'Unknown User',
              username: 'unknown'
            },
            replies: post.replies || []
          };
        }
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
    const posts = await handleResponse(response);
    
    // Fetch author details for each post and its replies
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        try {
          // Get post author details
          const authorDetails = post.author?._id ? 
            await communityService.getUserDetails(post.author._id) : 
            { name: 'Unknown User', username: 'unknown' };
          
          // Get reply author details
          const repliesWithAuthors = await Promise.all(
            (post.replies || []).map(async (reply) => {
              try {
                const replyAuthorDetails = reply.author?._id ? 
                  await communityService.getUserDetails(reply.author._id) : 
                  { name: 'Unknown User', username: 'unknown' };
                
                return {
                  ...reply,
                  author: {
                    _id: reply.author?._id || 'unknown',
                    name: replyAuthorDetails.name || 'Unknown User',
                    username: replyAuthorDetails.username || 'unknown'
                  }
                };
              } catch (error) {
                console.error('Error fetching reply author details:', error);
                return {
                  ...reply,
                  author: {
                    _id: reply.author?._id || 'unknown',
                    name: 'Unknown User',
                    username: 'unknown'
                  }
                };
              }
            })
          );

          return {
            ...post,
            author: {
              _id: post.author?._id || 'unknown',
              name: authorDetails.name || 'Unknown User',
              username: authorDetails.username || 'unknown'
            },
            replies: repliesWithAuthors
          };
        } catch (error) {
          console.error('Error fetching post author details:', error);
          return {
            ...post,
            author: {
              _id: post.author?._id || 'unknown',
              name: 'Unknown User',
              username: 'unknown'
            },
            replies: post.replies || []
          };
        }
      })
    );

    return postsWithAuthors;
  },

  deletePost: async (postId) => {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  deleteReply: async (postId, replyId) => {
    const response = await fetch(`${API_URL}/posts/${postId}/replies/${replyId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }
}; 