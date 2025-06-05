import { Schema, model, type Document, Types } from "mongoose";

const bookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    plateNumber: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export interface BookingType extends Document {
  user: Types.ObjectId;
  startDate: String;
  endDate: String;
  plateNumber?: string;
}

const Booking = model<BookingType>("Booking", bookingSchema);
export default Booking;
