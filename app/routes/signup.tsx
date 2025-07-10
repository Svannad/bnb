import { data, Form, Link, redirect, useActionData } from "react-router";
import type { Route } from "../+types/root";
import User from "~/models/User";
import { useEffect } from "react";
import Vilhelm from "~/assest/vilhelm.jpg";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const mail = formData.get("mail");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (!name || typeof name !== "string" || !name.trim()) {
      return data({ error: "Name is required" }, { status: 400 });
    }
    if (!mail || typeof mail !== "string" || !mail.trim()) {
      return data({ error: "Email is required" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return data(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return data({ error: "Passwords do not match" }, { status: 400 });
    }

    await User.create({ name, mail, password });
    return redirect("/signin?success=true");
  } catch (error) {
    if (error instanceof Error) {
      return data({ error: error.message }, { status: 400 });
    }
  }
}

export default function SignUp() {
  const actionData = useActionData<{ error?: string }>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      alert("Registration successful! You can now log in.");
    }
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Left - Form Section */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-10 pb-20">
        <h1 className="text-4xl font-serif text-[#22392c] mb-4">
          Create Account
        </h1>
        <p className="text-[#7c6f67] mb-8">Sign up to get started</p>

        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-[#48302D] mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Your full name"
              className="w-full border border-[#d6c9b3] rounded-md p-3 text-[#22392c] bg-[#fffbee] placeholder:text-[#a3988e]"
            />
          </div>

          <div>
            <label htmlFor="mail" className="block text-[#48302D] mb-1">
              Email
            </label>
            <input
              id="mail"
              name="mail"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full border border-[#d6c9b3] rounded-md p-3 text-[#22392c] bg-[#fffbee] placeholder:text-[#a3988e]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[#48302D] mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full border border-[#d6c9b3] rounded-md p-3 text-[#22392c] bg-[#fffbee] placeholder:text-[#a3988e]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-[#48302D] mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              className="w-full border border-[#d6c9b3] rounded-md p-3 text-[#22392c] bg-[#fffbee] placeholder:text-[#a3988e]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#22392c] text-[#fffbee] py-3 rounded-md hover:bg-[#1a2d22] transition"
          >
            Sign Up
          </button>

          {actionData?.error && (
            <p className="text-red-800 text-sm pt-2">{actionData.error}</p>
          )}
        </Form>

        <p className="mt-6 text-sm text-[#48302D]">
          Already have a user?{" "}
          <Link to="/signin" className="underline hover:text-[#3a5f4c]">
            Log in here.
          </Link>
        </p>
      </div>

      {/* Right - Image Section */}
      <div className="hidden md:block w-1/2 ">
        <img src={Vilhelm} className="h-[100vh] object-cover object-left" />
      </div>
    </div>
  );
}
