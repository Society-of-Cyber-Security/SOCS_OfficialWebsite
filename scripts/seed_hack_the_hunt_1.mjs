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

// 1. Copy photos to public/uploads/hack-the-hunt-1/
const targetDir = path.resolve(process.cwd(), 'public/uploads/hack-the-hunt-1');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const sourceFiles = [
  {
    src: '/Users/Abhi/.gemini/antigravity-ide/brain/68d908d9-053d-408f-9ab1-2e7a6022446d/.user_uploaded/media_1788701113582.jpg',
    destName: 'hack-the-hunt-1-team.jpg',
    caption: 'Hack the Hunt 1.0 - Winning Team & Finalists',
    isFeatured: true
  },
  {
    src: '/Users/Abhi/.gemini/antigravity-ide/brain/68d908d9-053d-408f-9ab1-2e7a6022446d/.user_uploaded/media_1788701113525.jpg',
    destName: 'hack-the-hunt-1-lab-setup.jpg',
    caption: 'Hack the Hunt 1.0 - Lab Challenge Deployment & Operations',
    isFeatured: false
  },
  {
    src: '/Users/Abhi/.gemini/antigravity-ide/brain/68d908d9-053d-408f-9ab1-2e7a6022446d/.user_uploaded/media_1788701113539.jpg',
    destName: 'hack-the-hunt-1-live-hacking.jpg',
    caption: 'Hack the Hunt 1.0 - Live CTF & Clue Solving Session',
    isFeatured: false
  },
  {
    src: '/Users/Abhi/.gemini/antigravity-ide/brain/68d908d9-053d-408f-9ab1-2e7a6022446d/.user_uploaded/media_1788701113551.jpg',
    destName: 'hack-the-hunt-1-auditorium.jpg',
    caption: 'Hack the Hunt 1.0 - Auditorium Briefing & Problem Statements',
    isFeatured: false
  },
  {
    src: '/Users/Abhi/.gemini/antigravity-ide/brain/68d908d9-053d-408f-9ab1-2e7a6022446d/.user_uploaded/media_1788701113562.jpg',
    destName: 'hack-the-hunt-1-break.jpg',
    caption: 'Hack the Hunt 1.0 - Refreshment & Team Debriefing Break',
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
const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  location: String,
  type: String,
  isPublished: Boolean
}, { strict: false });
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

// Find admin user or first user
let user = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
if (!user) {
  user = await User.findOne({});
}
if (!user) {
  user = await User.create({ name: 'System Admin', email: 'admin@socs.org', role: 'superadmin' });
}

// Find or create "Hack the Hunt 1.0" Event
let event = await Event.findOne({ title: /Hack the Hunt 1\.0/i });
if (!event) {
  event = await Event.create({
    title: 'Hack the Hunt 1.0',
    description: 'Inaugural edition of the SOCS cybersecurity treasure hunt & CTF competition.',
    date: new Date('2025-03-10'),
    location: 'Campus Auditorium & Cyber Lab',
    type: 'ctf',
    isPublished: true
  });
  console.log("Created Event: Hack the Hunt 1.0");
} else {
  console.log("Found existing event:", event.title);
}

// Insert / update gallery images
for (const item of sourceFiles) {
  const fileUrl = `/uploads/hack-the-hunt-1/${item.destName}`;
  const existing = await GalleryImage.findOne({ url: fileUrl });
  if (existing) {
    existing.caption = item.caption;
    existing.album = 'Hack the Hunt 1.0';
    existing.eventId = event._id;
    existing.isFeatured = item.isFeatured;
    await existing.save();
    console.log(`Updated gallery image: ${item.destName}`);
  } else {
    await GalleryImage.create({
      filename: item.destName,
      url: fileUrl,
      caption: item.caption,
      album: 'Hack the Hunt 1.0',
      eventId: event._id,
      isFeatured: item.isFeatured,
      uploadedBy: user._id,
      createdAt: new Date('2025-03-10')
    });
    console.log(`Created gallery image: ${item.destName}`);
  }
}

console.log("All 5 photos added to 'Hack the Hunt 1.0' album successfully!");
await mongoose.disconnect();
process.exit(0);
