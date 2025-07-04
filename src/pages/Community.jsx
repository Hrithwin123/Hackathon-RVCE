import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, Send, Heart, Search, Loader2, AlertCircle, Users, Trash2, MoreVertical, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { communityService } from '../services/communityService.js';
import { formatTimestamp } from '../utils/helpers.js';
import Navbar from '../Components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { translationService } from '../services/translationService';

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
  const [searchLoading, setSearchLoading] = useState(false);
  const observer = useRef();
  const lastPostRef = useRef();
  const [deleteConfirm, setDeleteConfirm] = useState({ postId: null, replyId: null });
  const { currentLanguage } = useLanguage();
  const [translating, setTranslating] = useState({});
  const [translatedContent, setTranslatedContent] = useState({});

  const translations = {
    title: useTranslation("Community Forum"),
    subtitle: useTranslation("Share your gardening experiences and get help from other plant enthusiasts"),
    newPost: {
      placeholder: useTranslation("Share your gardening experience or ask a question..."),
      button: useTranslation("Post"),
      posting: useTranslation("Posting...")
    },
    reply: {
      placeholder: useTranslation("Write your reply..."),
      button: useTranslation("Reply"),
      replying: useTranslation("Replying...")
    },
    delete: {
      confirmTitle: useTranslation("Delete Confirmation"),
      confirmMessage: useTranslation("Are you sure you want to delete this?"),
      cancel: useTranslation("Cancel"),
      confirm: useTranslation("Delete"),
      deleting: useTranslation("Deleting...")
    },
    error: {
      post: useTranslation("Failed to create post. Please try again."),
      reply: useTranslation("Failed to add reply. Please try again."),
      delete: useTranslation("Failed to delete. Please try again."),
      load: useTranslation("Failed to load posts. Please refresh the page.")
    },
    empty: {
      title: useTranslation("No Posts Yet"),
      message: useTranslation("Be the first to share your gardening experience!")
    },
    translate: {
      button: useTranslation("अनुवाद करें", "Translate", "ಅನುವಾದಿಸಿ"),
      translating: useTranslation("अनुवाद हो रहा है...", "Translating...", "ಅನುವಾದವಾಗುತ್ತಿದೆ..."),
      original: useTranslation("मूल दिखाएं", "Show Original", "ಮೂಲ ತೋರಿಸಿ"),
      error: useTranslation("अनुवाद विफल रहा। कृपया पुनः प्रयास करें।", "Translation failed. Please try again.", "ಅನುವಾದ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.")
    },
    search: {
      placeholder: useTranslation("Search posts...")
    }
  };

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
      setLoading(true);
      const post = await communityService.createPost(userId, newPost.trim());
      
      // Fetch author details for the new post
      const authorDetails = await communityService.getUserDetails(userId);
      const postWithAuthor = {
        ...post,
        author: {
          _id: userId,
          name: authorDetails.name,
          username: authorDetails.username
        }
      };

      setPosts(prev => [postWithAuthor, ...prev]);
      setNewPost('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add reply
  const handleReply = async (postId) => {
    if (!replyContent[postId]?.trim()) return;

    try {
      setLoading(true);
      const updatedPost = await communityService.addReply(
        postId,
        userId,
        replyContent[postId].trim()
      );

      // Fetch author details for the new reply
      const authorDetails = await communityService.getUserDetails(userId);
      const updatedPostWithAuthor = {
        ...updatedPost,
        author: {
          _id: updatedPost.author._id,
          name: updatedPost.author.name,
          username: updatedPost.author.username
        },
        replies: updatedPost.replies.map(reply => {
          if (reply.author._id === userId) {
            return {
              ...reply,
              author: {
                _id: userId,
                name: authorDetails.name,
                username: authorDetails.username
              }
            };
          }
          return reply;
        })
      };

      setPosts(prev => prev.map(p => p._id === postId ? updatedPostWithAuthor : p));
      setReplyContent(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      setSearchLoading(true);
      setError(null);
      const results = await communityService.searchPosts(searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    try {
      setLoading(true);
      await communityService.deletePost(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
      setDeleteConfirm({ postId: null, replyId: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete reply
  const handleDeleteReply = async (postId, replyId) => {
    try {
      setLoading(true);
      await communityService.deleteReply(postId, replyId);
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            replies: post.replies.filter(reply => reply._id !== replyId)
          };
        }
        return post;
      }));
      setDeleteConfirm({ postId: null, replyId: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle translation
  const handleTranslate = async (content, type, id) => {
    if (translating[`${type}-${id}`]) return;
    
    try {
      setTranslating(prev => ({ ...prev, [`${type}-${id}`]: true }));
      
      // If already translated, toggle back to original
      if (translatedContent[`${type}-${id}`]) {
        setTranslatedContent(prev => {
          const newState = { ...prev };
          delete newState[`${type}-${id}`];
          return newState;
        });
      } else {
        // Translate the content
        const translated = await translationService.translate(content, currentLanguage);
        setTranslatedContent(prev => ({
          ...prev,
          [`${type}-${id}`]: translated
        }));
      }
    } catch (error) {
      console.error('Translation error:', error);
      setError(translations.translate.error);
    } finally {
      setTranslating(prev => ({ ...prev, [`${type}-${id}`]: false }));
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{translations.title}</h1>
          <p className="text-gray-600">{translations.subtitle}</p>
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
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={translations.search.placeholder}
                className="w-full p-3 pl-10 border border-gray-200 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {searchLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Search Results Header */}
        {searchResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-between"
          >
            <h2 className="text-lg font-semibold text-gray-800">
              Search Results for "{searchQuery}"
            </h2>
            <button
              onClick={handleClearSearch}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <span>Clear search</span>
              ×
            </button>
          </motion.div>
        )}

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
              placeholder={translations.newPost.placeholder}
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
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">
                      {formatTimestamp(post.timestamp)}
                    </span>
                    {post.author._id === userId && (
                      <div className="relative">
                        <button
                          onClick={() => setDeleteConfirm({ postId: post._id, replyId: null })}
                          className="p-1 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <p className="mb-4 text-gray-700">
                  {translatedContent[`post-${post._id}`] || post.content}
                </p>

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
                  <button
                    onClick={() => handleTranslate(post.content, 'post', post._id)}
                    className="text-green-500 hover:text-green-600 transition-colors flex items-center gap-1"
                    disabled={translating[`post-${post._id}`]}
                  >
                    <Globe className="w-4 h-4" />
                    {translating[`post-${post._id}`] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : translatedContent[`post-${post._id}`] ? (
                      translations.translate.original
                    ) : (
                      translations.translate.button
                    )}
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
                          placeholder={translations.reply.placeholder}
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
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm">
                              {formatTimestamp(reply.timestamp)}
                            </span>
                            {reply.author._id === userId && (
                              <button
                                onClick={() => setDeleteConfirm({ postId: post._id, replyId: reply._id })}
                                className="p-1 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="mb-2 text-gray-700">
                          {translatedContent[`reply-${reply._id}`] || reply.content}
                        </p>
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
                        <button
                          onClick={() => handleTranslate(reply.content, 'reply', reply._id)}
                          className="text-green-500 hover:text-green-600 transition-colors flex items-center gap-1"
                          disabled={translating[`reply-${reply._id}`]}
                        >
                          <Globe className="w-4 h-4" />
                          {translating[`reply-${reply._id}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : translatedContent[`reply-${reply._id}`] ? (
                            translations.translate.original
                          ) : (
                            translations.translate.button
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {(deleteConfirm.postId || deleteConfirm.replyId) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {deleteConfirm.replyId ? 'Delete Reply' : 'Delete Post'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {translations.delete.confirmMessage}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm({ postId: null, replyId: null })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {translations.delete.cancel}
                    </button>
                    <button
                      onClick={() => {
                        if (deleteConfirm.replyId) {
                          handleDeleteReply(deleteConfirm.postId, deleteConfirm.replyId);
                        } else {
                          handleDeletePost(deleteConfirm.postId);
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      {translations.delete.confirm}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
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
              {searchResults ? 'No posts found' : translations.empty.message}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}