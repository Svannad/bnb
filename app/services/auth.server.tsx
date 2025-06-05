import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export let authenticator = new Authenticator<string>();

async function verifyUser({
  mail,
  password,
}: {
  mail: string;
  password: string;
}) {
  try {
    const user = await mongoose.models.User.findOne({ mail }).select(
      "+password",
    );

    if (!user) {
      throw new Error("No user found with this email.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid password.");
    }

    return user.id;
  } catch (error) {
    console.error("Error in verifyUser:", error);

    if (error instanceof mongoose.Error) {
      throw new Error("Database error occurred while verifying the user.");
    }
    if (error instanceof Error && error.message.includes("Invalid password")) {
      throw new Error("Invalid password.");
    }

    throw new Error("An unexpected error occurred while verifying the user.");
  }
}

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const mail = form.get("mail");
    const password = form.get("password");

    if (!mail || typeof mail !== "string" || !mail.trim()) {
      throw new Error("Email is required and must be a valid string.");
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      throw new Error("Password is required and must be a valid string.");
    }

    try {
      return await verifyUser({ mail, password });
    } catch (error) {
      console.error("Error in FormStrategy:", error);
      throw new Error("Authentication failed. Please check your credentials.");
    }
  }),
  "user-pass",
);
