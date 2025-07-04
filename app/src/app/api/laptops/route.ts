import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Schema, model, models } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://assets:India%40123@node-js.oxpae8x.mongodb.net/?retryWrites=true&w=majority&appName=Node-js';

if (!mongoose.connections[0].readyState) {
  mongoose.connect(MONGODB_URI, {
    dbName: 'asset-management',
  });
}

const laptopSchema = new Schema({
  seatNo: { type: String, required: false },
  location: { type: String, required: false },
  assetTag: { type: String, required: false },
  sysNo: { type: String, required: false },
  processor: { type: String, required: false },
  ram: { type: String, required: false },
  hddSize: { type: String, required: false },
  make: { type: String, required: false },
  os: { type: String, required: false },
  serviceTag: { type: String, required: false },
  column1: { type: String, required: false },
  remarks: { type: String, required: false },
  purchasedOn: { type: Date, required: false },
}, { timestamps: true });

const Laptop = models.Laptop || model('Laptop', laptopSchema);

export async function GET() {
  const laptops = await Laptop.find();
  return NextResponse.json(laptops);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Check if data is an array (for batch import) or a single object
  if (Array.isArray(data)) {
    try {
      const laptops = await Laptop.insertMany(data);
      return NextResponse.json(laptops);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
  } else {
    // Handle single laptop creation
    const laptop = new Laptop(data);
    await laptop.save();
    return NextResponse.json(laptop);
  }
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const laptop = await Laptop.findByIdAndUpdate(data._id, data, { new: true });
  return NextResponse.json(laptop);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await Laptop.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
} 