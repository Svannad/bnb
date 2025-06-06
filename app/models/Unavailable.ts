import { Schema, model, type Document, Types } from "mongoose";

const unavailableSchema = new Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, default: "" }, // optional description
});

export interface UnavailableType extends Document {
  startDate: Date;
  endDate: Date;
  reason: string;
}

const Unavailable = model("Unavailable", unavailableSchema);
export default Unavailable;
