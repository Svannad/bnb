import { data, Form, Link, redirect, useActionData } from "react-router";
import { authenticator } from "~/services/auth.server";
import type { Route } from "../+types/root";
import { commitSession, getSession } from "~/services/session.server";
import Vilhelm from "~/assest/vilhelm.jpg"

export async function action({ request }: Route.ActionArgs) {
  try {
    const userId = await authenticator.authenticate("user-pass", request);
    const session = await getSession(request.headers.get("cookie"));

    session.set("authUserId", userId);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
}

export default function SignIn() {
  const actionData = useActionData<{ error?: string }>();

  return (
    <div className="flex min-h-screen">
      {/* Left - Form Section */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-10 pb-20">
        <h1 className="text-4xl font-serif text-[#22392c] mb-4">
          Welcome Back!
        </h1>
        <p className="text-[#7c6f67] mb-8">Sign in to your account</p>

        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="mail" className="block text-[#48302D] mb-1">
              Email
            </label>
            <input
              id="mail"
              type="email"
              name="mail"
              placeholder="you@example.com"
              className="w-full border border-[#d6c9b3] rounded-md p-3 text-[#22392c] bg-[#fffbee] placeholder:text-[#a3988e]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[#48302D] mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full border border-[#d6c9b3] rounded-md p-3 text-[#22392c] bg-[#fffbee] placeholder:text-[#a3988e]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#22392c] text-[#fffbee] py-3 rounded-md hover:bg-[#1a2d22] transition"
          >
            Sign In
          </button>

          {actionData?.error && (
            <p className="text-red-800 text-sm pt-2">{actionData.error}</p>
          )}
        </Form>

        <p className="mt-6 text-sm text-[#48302D]">
          Don’t have a user?{" "}
          <Link to="/signup" className="underline hover:text-[#3a5f4c]">
            Sign up here.
          </Link>
        </p>
      </div>

      {/* Right - Image Section */}
      <div
        className="hidden md:block w-1/2 "
      >
        <img src={Vilhelm} className="h-[100vh] object-cover object-left" />
      </div>
    </div>
  );
}
