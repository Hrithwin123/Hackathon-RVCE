import mongoose from 'mongoose';
import Users from '../models/UserSchema.js';
import bcrypt from 'bcrypt';

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/flowers');
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await Users.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists:', existingUser._id);
      process.exit(0);
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = await Users.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword
    });

    console.log('Test user created:', testUser._id);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestUser(); 