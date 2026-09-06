import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("MONGO_URI not found!");
  process.exit(1);
}

// Target directory
const targetDir = path.resolve(process.cwd(), 'public/uploads/hack-the-hunt-1');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const sourceFiles = [
  {
    src: '/Users/Abhi/.gemini/antigravity-ide/brain/68d908d9-053d-408f-9ab1-2e7a6022446d/.user_uploaded/media_1788701380581.jpg',
    destName: 'hack-the-hunt-1-podium-presentation.jpg',
    caption: 'Hack the Hunt 1.0 - Core Team Opening & Podium Presentation',
    isFeatured: true
  },
  {
    src: '/Users/Abhi/.gemini/antigravity-ide/brain/68d908d9-053d-408f-9ab1-2e7a6022446d/.user_uploaded/media_1788701380595.jpg',
    destName: 'hack-the-hunt-1-team-hacking.jpg',
    caption: 'Hack the Hunt 1.0 - Team Sprint & Live Exploit Development',
    isFeatured: false
  },
  {
    src: '/Users/Abhi/.gemini/antigravity-ide/brain/68d908d9-053d-408f-9ab1-2e7a6022446d/.user_uploaded/media_1788701380568.jpg',
    destName: 'hack-the-hunt-1-terminal-session.jpg',
    caption: 'Hack the Hunt 1.0 - Terminal Recon & Scripting Session',
    isFeatured: false
  },
  {
    src: '/Users/Abhi/.gemini/antigravity-ide/brain/68d908d9-053d-408f-9ab1-2e7a6022446d/.user_uploaded/media_1788701380553.jpg',
    destName: 'hack-the-hunt-1-lab-recording.jpg',
    caption: 'Hack the Hunt 1.0 - Lab Operations & Live Event Recording',
    isFeatured: false
  }
];

for (const item of sourceFiles) {
  const destPath = path.join(targetDir, item.destName);
  fs.copyFileSync(item.src, destPath);
  console.log(`Copied: ${item.destName}`);
}

// 2. Connect to MongoDB and insert records
await mongoose.connect(mongoUri);
console.log("Connected to MongoDB");

// User model schema
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Event model schema
const eventSchema = new mongoose.Schema({}, { strict: false });
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

// GalleryImage schema
const gallerySchema = new mongoose.Schema({
  filename: String,
  url: String,
  caption: String,
  album: String,
  eventId: mongoose.Schema.Types.ObjectId,
  isFeatured: Boolean,
  uploadedBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now }
}, { strict: false });
const GalleryImage = mongoose.models.GalleryImage || mongoose.model('GalleryImage', gallerySchema);

let user = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
if (!user) user = await User.findOne({});
let event = await Event.findOne({ title: /Hack the Hunt 1\.0/i });

for (const item of sourceFiles) {
  const fileUrl = `/uploads/hack-the-hunt-1/${item.destName}`;
  const existing = await GalleryImage.findOne({ url: fileUrl });
  if (existing) {
    existing.caption = item.caption;
    existing.album = 'Hack the Hunt 1.0';
    existing.eventId = event?._id;
    existing.isFeatured = item.isFeatured;
    await existing.save();
    console.log(`Updated gallery image: ${item.destName}`);
  } else {
    await GalleryImage.create({
      filename: item.destName,
      url: fileUrl,
      caption: item.caption,
      album: 'Hack the Hunt 1.0',
      eventId: event?._id,
      isFeatured: item.isFeatured,
      uploadedBy: user?._id,
      createdAt: new Date('2025-03-10')
    });
    console.log(`Created gallery image: ${item.destName}`);
  }
}

console.log("Successfully added all 4 new photos to 'Hack the Hunt 1.0' album!");
await mongoose.disconnect();
process.exit(0);
