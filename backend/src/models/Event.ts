import mongoose, { Document, Schema } from 'mongoose';

export enum EventType {
  WORKSHOP = 'workshop',
  CTF = 'ctf',
  MEETUP = 'meetup',
  GUEST_SPEAKER = 'guest_speaker',
  OTHER = 'other'
}

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  type: EventType;
  registrationLink?: string;
  isPublished: boolean;
  createdAt: Date;
}

const EventSchema: Schema = new Schema({
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
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  type: {
    type: String,
    enum: Object.values(EventType),
    default: EventType.OTHER
  },
  registrationLink: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { strict: true });

export default mongoose.model<IEvent>('Event', EventSchema);
