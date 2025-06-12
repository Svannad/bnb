import { Schema, model, type Document } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
    {
      mail: {
        type: String,
        required: true,
        unique: [true, "User already exists."] 
      },
      name: {
        type: String
      },
      phone: {
        type: String
      },
      password: {
        type: String,
        required: true,
        select: false
      },
     role: {
      type: String,
      enum: ["host", "guest"],
      default: "guest",
      required: true,
    }
    },
    { timestamps: true } 

  );

  export interface UserType extends Document {
    mail: string;
    name?: string;
    phone?: string;
    password: string;
    role: "host" | "guest";
  }

  userSchema.pre("save", async function (next) {
    const user = this; 
  
    if (!user.isModified("password")) {
      return next(); 
    }
  
    const salt = await bcrypt.genSalt(10); 
    user.password = await bcrypt.hash(user.password, salt); 
    next(); 
  });

  const User = model<UserType>("User", userSchema);
  export default User;