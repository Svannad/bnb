import { Schema, model, type Document, Types } from "mongoose";

const bookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    plateNumber: { type: String, required: false },
    package: {
      type: String,
      enum: ["bed+room", "maddress+room", "maddress"],
      required: true,
    },
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
  package: "bed+room" | "maddress+room" | "maddress";
}

const Booking = model<BookingType>("Booking", bookingSchema);
export default Booking;
