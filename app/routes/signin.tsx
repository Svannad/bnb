import { data, Form, redirect, useActionData } from "react-router";
import { authenticator } from "~/services/auth.server";
import type { Route } from "../+types/root";
import { commitSession, getSession } from "~/services/session.server"; // adjust path to your file

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
    <div id="sign-in-page" className="page">
      <h1>Sign In</h1>
      <Form id="sign-in-form" method="post">
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
          <button>Sign In</button>
        </div>
        {actionData?.error && (
          <div className="mt-4 text-red-800 text-left">
            <p>{actionData.error}</p>
          </div>
        )}
      </Form>
    </div>
  );
}
