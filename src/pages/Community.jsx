import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, Send, Heart, Search, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { communityService } from '../services/communityService.js';
import { formatTimestamp } from '../utils/helpers.js';

export default function Community() {
  const { id: userId } = useParams(); // Get user ID from URL params
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const observer = useRef();
  const lastPostRef = useRef();

  // Load posts
  const loadPosts = async (page = 1) => {
    try {
      setLoading(true);
      const data = await communityService.getPosts(page);
      if (page === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      setHasMore(page < data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPosts();
  }, []);

  // Infinite scroll setup
  useEffect(() => {
    if (loading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadPosts(currentPage + 1);
      }
    });

    if (lastPostRef.current) {
      observer.current.observe(lastPostRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore, currentPage]);

  // Create new post
  const handleNewPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const post = await communityService.createPost(userId, newPost.trim());
      setPosts(prev => [post, ...prev]);
      setNewPost('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Add reply
  const handleReply = async (postId) => {
    if (!replyContent[postId]?.trim()) return;

    try {
      const updatedPost = await communityService.addReply(
        postId,
        userId,
        replyContent[postId].trim()
      );
      setPosts(prev => prev.map(p => p._id === postId ? updatedPost : p));
      setReplyContent(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle post like
  const handlePostLike = async (postId) => {
    try {
      const { likes } = await communityService.togglePostLike(postId, userId);
      setPosts(prev => prev.map(p => 
        p._id === postId ? { ...p, likes } : p
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle reply like
  const handleReplyLike = async (postId, replyId) => {
    try {
      const { likes } = await communityService.toggleReplyLike(postId, replyId, userId);
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const updatedReplies = p.replies.map(r => 
            r._id === replyId ? { ...r, likes } : r
          );
          return { ...p, replies: updatedReplies };
        }
        return p;
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  // Search posts
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const results = await communityService.searchPosts(searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
    }
  };

  const displayPosts = searchResults || posts;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Search size={20} />
          </button>
        </div>
      </form>

      {/* New Post Form */}
      <form onSubmit={handleNewPost} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Send size={20} />
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        <AnimatePresence>
          {displayPosts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              ref={index === displayPosts.length - 1 ? lastPostRef : null}
              className="bg-white p-4 rounded-lg shadow"
            >
              {/* Post Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex flex-col">
                  <span className="font-semibold">{post.author.name}</span>
                  <span className="text-gray-500 text-sm">@{post.author.username}</span>
                </div>
                <span className="text-gray-500 text-sm ml-auto">
                  {formatTimestamp(post.timestamp)}
                </span>
              </div>

              {/* Post Content */}
              <p className="mb-4">{post.content}</p>

              {/* Post Actions */}
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => handlePostLike(post._id)}
                  className={`flex items-center gap-1 ${
                    post.likes.includes(userId) ? 'text-red-500' : 'text-gray-500'
                  }`}
                >
                  <Heart size={20} />
                  <span>{post.likes.length}</span>
                </button>
                <button
                  onClick={() => setReplyContent(prev => ({
                    ...prev,
                    [post._id]: prev[post._id] ? '' : ' '
                  }))}
                  className="flex items-center gap-1 text-gray-500"
                >
                  <MessageCircle size={20} />
                  <span>{post.replies.length}</span>
                </button>
              </div>

              {/* Reply Form */}
              {replyContent[post._id] !== undefined && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleReply(post._id);
                  }}
                  className="mb-4"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyContent[post._id]}
                      onChange={(e) => setReplyContent(prev => ({
                        ...prev,
                        [post._id]: e.target.value
                      }))}
                      placeholder="Write a reply..."
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              )}

              {/* Replies */}
              {post.replies.length > 0 && (
                <div className="space-y-4 mt-4 pl-4 border-l-2 border-gray-100">
                  {post.replies.map(reply => (
                    <div key={reply._id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex flex-col">
                          <span className="font-semibold">{reply.author.name}</span>
                          <span className="text-gray-500 text-sm">@{reply.author.username}</span>
                        </div>
                        <span className="text-gray-500 text-sm ml-auto">
                          {formatTimestamp(reply.timestamp)}
                        </span>
                      </div>
                      <p className="mb-2">{reply.content}</p>
                      <button
                        onClick={() => handleReplyLike(post._id, reply._id)}
                        className={`flex items-center gap-1 ${
                          reply.likes.includes(userId) ? 'text-red-500' : 'text-gray-500'
                        }`}
                      >
                        <Heart size={16} />
                        <span>{reply.likes.length}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-blue-500" size={24} />
          </div>
        )}

        {/* No Posts Message */}
        {!loading && displayPosts.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            {searchResults ? 'No posts found' : 'No posts yet. Be the first to post!'}
          </div>
        )}
      </div>
    </div>
  );
}