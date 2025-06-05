import { Schema, model, type Document } from "mongoose";

const roomSchema = new Schema(
  {
    title: String,
    description: String,
  },
  {
    toObject: {
      flattenObjectIds: true,
      getters: true,
    },
  },
);

export interface RoomType extends Document {
  title: string;
  description: string;
}

const Room = model<RoomType>("Room", roomSchema);
export default Room;
