import { Form, Link, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import {
  getSession,
  sessionStorage,
} from "~/services/session.server"; // adjust path to your file
import User from "~/models/User";
import type { UserType } from "~/models/User"; // or wherever it's defined

export function meta({}: Route.MetaArgs) {
  return [{ title: "BNB" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("cookie"));
  const authUserId = session.get("authUserId");

  if (!authUserId) {
    throw redirect("/signin");
  }

  const user = await User.findById(authUserId).lean();
  return { user };
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
  const { user } = useLoaderData() as { user: UserType };

  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-500">Profil</h1>
      <p>Brúkara Info</p>
      <p>Bookings</p>
      <section className="flex flex-col items-center text-center w-full">
        <div className="flex flex-row justify-between items-center w-full mb-12">
          <span className="w-[25px]"></span>
          <h1 className="font-serif text-2xl font-medium text-left text-[#48302D]">
            My Profile
          </h1>
          <Link to="/profile/update"></Link>
        </div>

        <div>
          <h1 className="text-2xl font-medium text-[#48302D]">{user.name}</h1>
          <p className="text-[#48302D]">{user.mail}</p>
        </div>
      </section>
      <Form method="post">
        <button>Logout</button>
      </Form>
    </>
  );
}
