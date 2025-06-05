import { Schema, model, type Document, Types } from "mongoose";

const bookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    plateNumber: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export interface BookingType extends Document {
  user: Types.ObjectId;
  room: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  plateNumber?: string;
}

const Booking = model<BookingType>("Booking", bookingSchema);
export default Booking;
