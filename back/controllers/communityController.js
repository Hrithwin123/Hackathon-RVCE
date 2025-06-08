import Post from '../models/Post.js';
import Community from '../models/Community.js';
import Users from '../models/UserSchema.js';
import { extractTags } from '../utils/helpers.js';

// Community Controllers
export const createCommunity = async (req, res) => {
  try {
    const { name, description, category, tags, rules } = req.body;
    const community = new Community({
      name,
      description,
      category,
      tags,
      rules,
      moderators: [req.user._id], // Creator becomes first moderator
      members: [req.user._id]     // Creator becomes first member
    });
    await community.save();
    res.status(201).json(community);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members', 'username')
      .populate('moderators', 'username');
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    await community.addMember(req.user._id);
    res.json({ message: 'Joined community successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Post Controllers
export const createPost = async (req, res) => {
  try {
    const { author, content } = req.body;
    const post = new Post({ author, content });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username')
      .populate('replies.author', 'username');

    const total = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addReply = async (req, res) => {
  try {
    const { postId } = req.params;
    const { author, content } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.replies.push({ author, content });
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate('author', 'username')
      .populate('replies.author', 'username');

    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const togglePostLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleReplyLike = async (req, res) => {
  try {
    const { postId, replyId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const reply = post.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const likeIndex = reply.likes.indexOf(userId);
    if (likeIndex === -1) {
      reply.likes.push(userId);
    } else {
      reply.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json({ likes: reply.likes });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const { query } = req.query;
    const posts = await Post.find({
      content: { $regex: query, $options: 'i' }
    })
    .populate('author', 'username')
    .populate('replies.author', 'username')
    .sort({ timestamp: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User Controllers
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Users.findById(userId).select('name username email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Optional: Add authorization check here if needed
    // if (post.author.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: 'Not authorized to delete this post' });
    // }

    await Post.findByIdAndDelete(postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete reply
export const deleteReply = async (req, res) => {
  try {
    const { postId, replyId } = req.params;
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const reply = post.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Optional: Add authorization check here if needed
    // if (reply.author.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: 'Not authorized to delete this reply' });
    // }

    post.replies.pull(replyId);
    await post.save();
    
    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 