import { data, Form, Link, redirect, useActionData } from "react-router";
import type { Route } from "../+types/root";
import User from "~/models/User";
import { useEffect } from "react";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();

    const name = formData.get("name");
    const mail = formData.get("mail");
    const password = formData.get("password");

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

    const newUser = { name, mail, password };
    const result = await User.create(newUser);

    // Success: Redirect to the login page with a success message in the query params
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
    const success = params.get("success");
    if (success === "true") {
      alert("Registration successful! You can now log in.");
    }
  }, []);

  return (
    <div id="sign-in-page" className="page">
      <h1>Sign Up</h1>
      <Form id="sign-in-form" method="post">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          name="name"
          aria-label="namel"
          placeholder="Type your name..."
          required
        />
        <label htmlFor="mail">Mail</label>
        <input
          id="mail"
          type="email"
          name="mail"
          aria-label="mail"
          placeholder="Type your mail..."
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          aria-label="password"
          placeholder="Type your password..."
          autoComplete="current-password"
        />
        <div className="btns">
          <button>Sign Up</button>
        </div>
        {actionData?.error && (
          <div className="mt-4 text-red-800 text-left">
            <p>{actionData.error}</p>
          </div>
        )}
      </Form>
      <div className="flex flex-row text-[#48302D]">
            <p className="mr-1">Already have a user?</p>
            <Link to="/signin" className="hover:text-green-700">Log in here.</Link>
          </div>
    </div>
  );
}
