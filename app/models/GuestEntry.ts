// models/GuestEntry.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface GuestEntry extends Document {
  user: Types.ObjectId; // reference to User model
  message: string;
  rating: number; // 1–5 stars
  createdAt: Date;
}

const GuestEntrySchema = new Schema<GuestEntry>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "guestbook" }
);

export default mongoose.models.GuestEntry ||
  mongoose.model<GuestEntry>("GuestEntry", GuestEntrySchema);
