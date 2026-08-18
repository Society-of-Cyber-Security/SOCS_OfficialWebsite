import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IGalleryImage extends Document {
  filename: string;
  url: string;
  caption?: string;
  uploadedBy: IUser['_id'];
  createdAt: Date;
}

const GalleryImageSchema: Schema = new Schema({
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: [true, 'Please provide an image url']
  },
  caption: {
    type: String,
    maxlength: [200, 'Caption can not be more than 200 characters']
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

export default mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);
