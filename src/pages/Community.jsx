import { useState, useCallback, useRef, useEffect } from 'react';
import { MessageCircle, Users, Send, Heart, MessageSquare, MoreHorizontal, Search, Filter, Leaf, Clock, ChevronDown, ChevronUp, User, Bot, Camera, Image } from 'lucide-react';
import Navbar from '../Components/Navbar';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';


const CommunityChat = () => {

  const {id} = useParams()

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "GreenThumb_Sarah",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      content: "My tomato plants are showing yellow spots on the leaves. Has anyone experienced this before? I'm worried it might be blight but not sure. Any advice would be greatly appreciated! 🍅",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 12,
      replies: [
        {
          id: 101,
          author: "PlantDoctor_Mike",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
          content: "Yellow spots could be early blight or bacterial spot. Check if the spots have dark rings around them. If so, it's likely early blight. Remove affected leaves and improve air circulation.",
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
          likes: 8,
          isExpert: true
        },
        {
          id: 102,
          author: "GreenThumb_Sarah",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
          content: "Thank you! The spots do have dark rings. I'll remove the affected leaves today. Should I use any fungicide?",
          timestamp: new Date(Date.now() - 1.2 * 60 * 60 * 1000),
          likes: 3
        }
      ],
      tags: ["tomato", "disease", "help"],
      isLiked: false,
      showReplies: true
    },
    {
      id: 2,
      author: "CactusLover_Emma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      content: "Just wanted to share my collection of succulents! After 3 years of trial and error, I finally have a thriving desert garden. The key was learning proper drainage techniques. Happy to share tips! 🌵✨",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 28,
      replies: [
        {
          id: 201,
          author: "NewbiePlanter",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Newbie",
          content: "Your collection looks amazing! I keep killing my succulents. What drainage method do you recommend?",
          timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
          likes: 5
        },
        {
          id: 202,
          author: "CactusLover_Emma",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
          content: "I use a mix of cactus soil, perlite, and small gravel. Make sure pots have drainage holes and never let them sit in water!",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          likes: 12
        }
      ],
      tags: ["succulents", "tips", "collection"],
      isLiked: true,
      showReplies: false
    },
    {
      id: 3,
      author: "OrganicGardener_Joe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joe",
      content: "Question for the community: What's your favorite natural pest control method? I'm dealing with aphids on my roses and want to avoid chemicals. My grandmother used to make a soap spray but I can't remember the recipe! 🌹",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      likes: 15,
      replies: [
        {
          id: 301,
          author: "NaturalNurturer",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Natural",
          content: "Neem oil spray works wonders! Mix 2 tbsp neem oil, 1 tsp mild soap, and 1 quart water. Spray in evening to avoid leaf burn.",
          timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000),
          likes: 9
        },
        {
          id: 302,
          author: "Grandma_Greens",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grandma",
          content: "The soap spray recipe: 1-2 tbsp mild dish soap in 1 cup water. Spray directly on aphids. Works like a charm! Your grandma knew best! 💚",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          likes: 18,
          isHelpful: true
        }
      ],
      tags: ["organic", "pest-control", "roses"],
      isLiked: false,
      showReplies: true
    }
  ]);

  const [newPost, setNewPost] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('recent');
  const [isPosting, setIsPosting] = useState(false);

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNewPost = async () => {
    if (!newPost.trim()) return;
    
    setIsPosting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const post = {
      id: Date.now(),
      author: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      content: newPost.trim(),
      timestamp: new Date(),
      likes: 0,
      replies: [],
      tags: [],
      isLiked: false,
      showReplies: false
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setIsPosting(false);
  };

  const handleReply = async (postId) => {
    if (!replyText.trim()) return;
    
    const reply = {
      id: Date.now(),
      author: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      content: replyText.trim(),
      timestamp: new Date(),
      likes: 0
    };

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, replies: [...post.replies, reply], showReplies: true }
        : post
    ));
    
    setReplyText('');
    setReplyingTo(null);
  };

  const toggleLike = (postId, replyId = null) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        if (replyId) {
          return {
            ...post,
            replies: post.replies.map(reply =>
              reply.id === replyId
                ? { ...reply, likes: reply.likes + (reply.isLiked ? -1 : 1), isLiked: !reply.isLiked }
                : reply
            )
          };
        } else {
          return {
            ...post,
            likes: post.likes + (post.isLiked ? -1 : 1),
            isLiked: !post.isLiked
          };
        }
      }
      return post;
    }));
  };

  const toggleReplies = (postId) => {
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, showReplies: !post.showReplies } : post
    ));
  };

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
              value: 25,
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
                  radius: 4
                },
                triangle: {
                  sides: 5
                }
              }
            },
            opacity: {
              value: 0.15,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.05,
                sync: false
              }
            },
            size: {
              value: 6,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 2,
                sync: false
              }
            },
            move: {
              enable: true,
              speed: 0.6,
              direction: "none",
              random: true,
              straight: false,
              outModes: {
                default: "out"
              }
            }
          },
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "grab"
              }
            },
            modes: {
              grab: {
                distance: 100,
                links: {
                  opacity: 0.2
                }
              }
            }
          },
          background: {
            color: "transparent"
          }
        }}
      />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={`float-${i}`}
            className="absolute w-12 h-12 rounded-full bg-green-200 opacity-10 animate-float"
            style={{
              top: `${15 + i * 15}%`,
              left: `${5 + i * 15}%`,
              animationDelay: `${i * 3}s`,
              animationDuration: `${20 + i * 3}s`
            }}
          />
        ))}
        
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
            animationDuration: '12s'
          }}
        />
        <div
          className="absolute bottom-20 left-0 w-96 h-96 rounded-full opacity-8 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
            animationDuration: '15s',
            animationDelay: '2s'
          }}
        />
      </div>

      <Navbar id={id}/>
      
      <div className="relative max-w-4xl mx-auto p-6 pt-8 z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full mb-4 backdrop-blur-sm">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Plant Community</h1>
          <p className="text-gray-600">Connect with fellow plant enthusiasts, share experiences, and get expert advice</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="unanswered">Unanswered</option>
                <option value="expert">Expert Answers</option>
              </select>
            </div>
          </div>
        </div>

        {/* New Post */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your plant question, tip, or experience with the community..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Image className="w-5 h-5 cursor-pointer hover:text-green-500" />
                  <Camera className="w-5 h-5 cursor-pointer hover:text-green-500" />
                </div>
                <button
                  onClick={handleNewPost}
                  disabled={!newPost.trim() || isPosting}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isPosting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6"
              >
                {/* Post Header */}
                <div className="flex items-start gap-4">
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="w-12 h-12 rounded-full border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{post.author}</h3>
                      {post.replies.some(r => r.isExpert) && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                          Expert Replied
                        </span>
                      )}
                      {post.replies.some(r => r.isHelpful) && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                          Helpful Answer
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Clock className="w-4 h-4" />
                      {formatTimeAgo(post.timestamp)}
                    </div>
                    
                    {/* Post Content */}
                    <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>
                    
                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Post Actions */}
                    <div className="flex items-center gap-6 text-gray-500">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 hover:text-red-500 transition-colors ${
                          post.isLiked ? 'text-red-500' : ''
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      
                      <button
                        onClick={() => toggleReplies(post.id)}
                        className="flex items-center gap-2 hover:text-green-500 transition-colors"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm">{post.replies.length} replies</span>
                        {post.showReplies ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                        className="text-sm hover:text-green-500 transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                <AnimatePresence>
                  {post.showReplies && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pl-16 space-y-4"
                    >
                      {post.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <img
                              src={reply.avatar}
                              alt={reply.author}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-800 text-sm">{reply.author}</h4>
                                {reply.isExpert && (
                                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                    Expert
                                  </span>
                                )}
                                {reply.isHelpful && (
                                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                    Helpful
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mb-2">{formatTimeAgo(reply.timestamp)}</p>
                              <p className="text-gray-700 text-sm leading-relaxed mb-3">{reply.content}</p>
                              <button
                                onClick={() => toggleLike(post.id, reply.id)}
                                className={`flex items-center gap-1 text-xs hover:text-red-500 transition-colors ${
                                  reply.isLiked ? 'text-red-500' : 'text-gray-500'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${reply.isLiked ? 'fill-current' : ''}`} />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reply Input */}
                <AnimatePresence>
                  {replyingTo === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pl-16"
                    >
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                              rows="3"
                            />
                            <div className="flex items-center justify-end gap-2 mt-3">
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReply(post.id)}
                                disabled={!replyText.trim()}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg text-sm font-medium"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        <div className="text-center mt-8">
          <button className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 px-8 py-3 rounded-xl font-medium border border-gray-200 transition-colors">
            Load More Discussions
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;