import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'vegetables', 'flowers', 'succulents', 'herbs', 'trees', 'indoor', 'outdoor'],
    default: 'general'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  rules: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
communitySchema.index({ name: 1 });
communitySchema.index({ category: 1 });
communitySchema.index({ tags: 1 });

// Virtual for member count
communitySchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to add a member
communitySchema.methods.addMember = async function(userId) {
  if (!this.members.includes(userId)) {
    this.members.push(userId);
    return this.save();
  }
  return this;
};

// Method to remove a member
communitySchema.methods.removeMember = async function(userId) {
  const index = this.members.indexOf(userId);
  if (index !== -1) {
    this.members.splice(index, 1);
    return this.save();
  }
  return this;
};

// Method to add a moderator
communitySchema.methods.addModerator = async function(userId) {
  if (!this.moderators.includes(userId)) {
    this.moderators.push(userId);
    return this.save();
  }
  return this;
};

// Method to remove a moderator
communitySchema.methods.removeModerator = async function(userId) {
  const index = this.moderators.indexOf(userId);
  if (index !== -1) {
    this.moderators.splice(index, 1);
    return this.save();
  }
  return this;
};

const Community = mongoose.model('Community', communitySchema);

export default Community; 