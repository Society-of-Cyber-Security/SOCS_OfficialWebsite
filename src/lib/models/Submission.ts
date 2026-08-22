import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export enum SubmissionType {
  PROJECT = 'project',
  EVENT = 'event',
  RESOURCE = 'resource',
  GALLERY = 'gallery'
}

export enum SubmissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface ISubmission extends Document {
  type: SubmissionType;
  title: string;
  description: string;
  submittedBy: IUser['_id'];
  status: SubmissionStatus;
  reviewedBy?: IUser['_id'];
  reviewNote?: string;
  attachmentUrl?: string;
  payload?: any;
  createdAt: Date;
}

const SubmissionSchema: Schema = new Schema({
  type: {
    type: String,
    enum: Object.values(SubmissionType),
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title can not be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description can not be more than 2000 characters']
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: Object.values(SubmissionStatus),
    default: SubmissionStatus.PENDING
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNote: {
    type: String
  },
  attachmentUrl: {
    type: String
  },
  payload: {
    type: Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { strict: true });

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
