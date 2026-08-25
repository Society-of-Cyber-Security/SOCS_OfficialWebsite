import mongoose, { Document, Schema } from 'mongoose';

export interface ITeamMember extends Document {
  name: string;
  slug: string;
  role: string;
  tier: 'core' | 'lead' | 'member';
  skills: string[];
  image?: string;
  github?: string;
  linkedin?: string;
  email?: string;
  createdAt: Date;
}

const TeamMemberSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  tier: { type: String, enum: ['core', 'lead', 'member'], default: 'member' },
  skills: [{ type: String }],
  image: { type: String },
  github: { type: String },
  linkedin: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { strict: true });

// Fix Next.js hot reload caching issue for Mongoose models
if (mongoose.models.TeamMember) {
  delete mongoose.models.TeamMember;
}

export default mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
