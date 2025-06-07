import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, Send, Heart, Search, Loader2, AlertCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { communityService } from '../services/communityService.js';
import { formatTimestamp } from '../utils/helpers.js';
import Navbar from '../Components/Navbar';

export default function Community() {
  const { id: userId } = useParams();
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

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* TSParticles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: {
            enable: true,
            zIndex: 0
          },
          particles: {
            number: {
              value: 30,
              density: {
                enable: true,
                value_area: 800
              }
            },
            color: {
              value: ["#22c55e", "#10b981", "#059669", "#34d399", "#6ee7b7"]
            },
            shape: {
              type: ["circle", "triangle"],
              options: {
                circle: {
                  radius: 6
                },
                triangle: {
                  sides: 5
                }
              }
            },
            opacity: {
              value: 0.2,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
              }
            },
            size: {
              value: 8,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 3,
                sync: false
              }
            },
            move: {
              enable: true,
              speed: 0.8,
              direction: "none",
              random: true,
              straight: false,
              outModes: {
                default: "out"
              },
              attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200
              }
            },
            rotate: {
              value: {
                min: 0,
                max: 360
              },
              direction: "random",
              animation: {
                enable: true,
                speed: 5
              }
            }
          },
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "grab"
              },
              onClick: {
                enable: true,
                mode: "push"
              }
            },
            modes: {
              grab: {
                distance: 140,
                links: {
                  opacity: 0.3
                }
              },
              push: {
                quantity: 4
              }
            }
          },
          background: {
            color: "transparent"
          }
        }}
      />

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={`float-${i}`}
            className="absolute w-16 h-16 rounded-full bg-green-200 opacity-20 animate-float"
            style={{
              top: `${10 + i * 12}%`,
              left: `${10 + i * 10}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + i * 2}s`
            }}
          />
        ))}
        
        {/* Gradient Orbs */}
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
            animationDuration: '8s'
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
            animationDuration: '10s',
            animationDelay: '1s'
          }}
        />
      </div>

      <Navbar id={userId} />
      
      <div className="relative max-w-4xl mx-auto p-6 pt-8 z-10">
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full mb-4 backdrop-blur-sm">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Garden</h1>
          <p className="text-gray-600">Share your gardening journey, ask questions, and connect with fellow plant enthusiasts</p>
        </div>

        {/* Search Bar */}
        <motion.form 
          onSubmit={handleSearch} 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="flex-1 p-3 border border-gray-200 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
        </motion.form>

        {/* New Post Form */}
        <motion.form 
          onSubmit={handleNewPost} 
          className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 p-3 border border-gray-200 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </motion.form>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts List */}
        <div className="space-y-6">
          <AnimatePresence>
            {displayPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                ref={index === displayPosts.length - 1 ? lastPostRef : null}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6"
              >
                {/* Post Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {post.author.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{post.author.name}</span>
                      <span className="text-gray-500 text-sm">@{post.author.username}</span>
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {formatTimestamp(post.timestamp)}
                  </span>
                </div>

                {/* Post Content */}
                <p className="mb-4 text-gray-700">{post.content}</p>

                {/* Post Actions */}
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => handlePostLike(post._id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                      post.likes.includes(userId) 
                        ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Heart size={18} className={post.likes.includes(userId) ? 'fill-current' : ''} />
                    <span>{post.likes.length}</span>
                  </button>
                  <button
                    onClick={() => setReplyContent(prev => ({
                      ...prev,
                      [post._id]: prev[post._id] ? '' : ' '
                    }))}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span>{post.replies.length}</span>
                  </button>
                </div>

                {/* Reply Form */}
                <AnimatePresence>
                  {replyContent[post._id] !== undefined && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleReply(post._id);
                      }}
                      className="mb-4 overflow-hidden"
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
                          className="flex-1 p-3 border border-gray-200 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Replies */}
                {post.replies.length > 0 && (
                  <div className="space-y-4 mt-4 pl-4 border-l-2 border-gray-100">
                    {post.replies.map(reply => (
                      <motion.div 
                        key={reply._id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-xl"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {reply.author.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800">{reply.author.name}</span>
                              <span className="text-gray-500 text-sm">@{reply.author.username}</span>
                            </div>
                          </div>
                          <span className="text-gray-500 text-sm">
                            {formatTimestamp(reply.timestamp)}
                          </span>
                        </div>
                        <p className="mb-2 text-gray-700">{reply.content}</p>
                        <button
                          onClick={() => handleReplyLike(post._id, reply._id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                            reply.likes.includes(userId) 
                              ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          <Heart size={16} className={reply.likes.includes(userId) ? 'fill-current' : ''} />
                          <span>{reply.likes.length}</span>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-green-500" size={24} />
            </div>
          )}

          {/* No Posts Message */}
          {!loading && displayPosts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-gray-500 py-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg"
            >
              {searchResults ? 'No posts found' : 'No posts yet. Be the first to post!'}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}