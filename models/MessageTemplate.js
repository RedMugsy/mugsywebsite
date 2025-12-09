import mongoose from 'mongoose';

const messageTemplateSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  channel: {
    type: String,
    enum: ['email', 'popup', 'response'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  body: {
    type: String,
    trim: true
  },
  signature: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

messageTemplateSchema.statics.findByKey = function(key) {
  return this.findOne({ key });
};

const MessageTemplate = mongoose.model('MessageTemplate', messageTemplateSchema);

export default MessageTemplate;
