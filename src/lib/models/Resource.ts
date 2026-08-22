import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export enum ResourceCategory {
  ROADMAP = 'roadmap',
  TOOL = 'tool',
  WRITEUP = 'writeup',
  BLOG = 'blog',
  OTHER = 'other'
}

export interface IResource extends Document {
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  url: string;
  uploadedBy: IUser['_id'];
  createdAt: Date;
}

const ResourceSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title can not be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description can not be more than 500 characters'],
    default: ''
  },
  category: {
    type: String,
    required: true,
    default: 'other'
  },
  tags: {
    type: [String],
    default: []
  },
  url: {
    type: String,
    required: [true, 'Please add a URL'],
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { strict: true });

if (mongoose.models.Resource) {
  delete mongoose.models.Resource;
}

export default mongoose.model<IResource>('Resource', ResourceSchema);
