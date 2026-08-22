import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IGalleryImage extends Document {
  filename: string;
  url: string;
  caption?: string;
  isFeatured?: boolean;
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
  isFeatured: {
    type: Boolean,
    default: false
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

if (mongoose.models.GalleryImage) {
  delete mongoose.models.GalleryImage;
}

export default mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);
