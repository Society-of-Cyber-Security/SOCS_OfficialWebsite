import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { Role } from './models/User';
import { connectDB } from './config/db';

dotenv.config();

connectDB();

const users = [
  {
    name: 'Member User',
    email: 'member@socs.ac.in',
    password: 'member123',
    role: Role.MEMBER
  },
  {
    name: 'Admin User',
    email: 'admin@socs.ac.in',
    password: 'admin123',
    role: Role.ADMIN
  },
  {
    name: 'Super Admin User',
    email: 'superadmin@socs.ac.in',
    password: 'super123',
    role: Role.SUPERADMIN
  }
];

const importData = async () => {
  try {
    await User.deleteMany();
    await User.create(users);
    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
