import { Form, redirect, type LoaderFunctionArgs } from "react-router";
import type { Route } from "./+types/home";
import { sessionStorage } from "~/services/session.server"; // adjust path to your file

export function meta({}: Route.MetaArgs) {
  return [{ title: "BNB" }];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const authUserId = session.get("authUserId");

  if (!authUserId) {
    throw redirect("/signin");
  }

  // If user is authenticated, return some data or just `null`
  return null;
}

export async function action({ request }) {
  // Get the session
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  // Destroy the session and redirect to the signin page
  return redirect("/signin", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
}

export default function Profile() {
  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-500">Profil</h1>
      <p>Brúkara Info</p>
      <p>Bookings</p>
      <Form method="post">
        <button>Logout</button>
      </Form>
    </>
  );
}
