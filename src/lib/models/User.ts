import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum Role {
  MEMBER = 'member',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export interface IUser extends Document {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: Role;
  refreshToken?: string;
  loginAttempts: number;
  lockUntil?: Date;
  isActive: boolean;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  isLocked(): boolean;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.MEMBER
  },
  refreshToken: {
    type: String,
    select: false
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { strict: true });

// Encrypt password using bcrypt
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password as string, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if account is locked
UserSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
