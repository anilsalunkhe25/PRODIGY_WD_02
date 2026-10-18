import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';

config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before seeding.');
}
if (ADMIN_PASSWORD.length < 12) {
  throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
}

await mongoose.connect(MONGODB_URI);
const email = ADMIN_EMAIL.trim().toLowerCase();
const existing = await User.findOne({ email });
if (existing) {
  await mongoose.disconnect();
  throw new Error(`An admin account already exists for ${email}.`);
}

const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
await User.create({ name: ADMIN_NAME.trim(), email, password, role: 'admin' });
console.log(`Admin account created for ${email}.`);
await mongoose.disconnect();
