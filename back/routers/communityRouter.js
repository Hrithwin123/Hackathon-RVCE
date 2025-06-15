import express from 'express';
import { 
  createPost,
  getPosts,
  addReply,
  togglePostLike,
  toggleReplyLike,
  searchPosts,
  getUserDetails,
  deletePost,
  deleteReply
} from '../controllers/communityController.js';

const router = express.Router();

// User routes
router.get('/user/:userId', getUserDetails);

// Post routes
router.post('/posts', createPost);
router.get('/posts', getPosts);
router.delete('/posts/:postId', deletePost);
router.post('/posts/:postId/replies', addReply);
router.delete('/posts/:postId/replies/:replyId', deleteReply);
router.post('/posts/:postId/like', togglePostLike);
router.post('/posts/:postId/replies/:replyId/like', toggleReplyLike);
router.get('/posts/search', searchPosts);

export default router; 