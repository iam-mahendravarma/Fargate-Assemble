import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Schema, model, models } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://assets:India%40123@node-js.oxpae8x.mongodb.net/?retryWrites=true&w=majority&appName=Node-js';

if (!mongoose.connections[0].readyState) {
  mongoose.connect(MONGODB_URI, {
    dbName: 'asset-management',
  });
}

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = models.User || model('User', userSchema);

export async function POST(req: NextRequest) {
  const { username, password, type } = await req.json();
  if (type === 'signup') {
    // Check if user exists
    const existing = await User.findOne({ username });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    const user = new User({ username, password });
    await user.save();
    return NextResponse.json({ success: true });
  } else if (type === 'signin') {
    const user = await User.findOne({ username, password });
    if (user) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } else if (type === 'create-user') {
    // In a real app, you would add authentication/authorization here
    // to ensure only authorized users can create new accounts.
    const { username: newUsername, password: newPassword } = await req.json();
    // Check if username already exists
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
    const newUser = new User({ username: newUsername, password: newPassword /* Hash password in real app */ });
    await newUser.save();
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
} 