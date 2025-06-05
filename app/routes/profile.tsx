import { Form, Link, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { getSession, sessionStorage } from "~/services/session.server"; 
import User from "~/models/User";
import Booking from "~/models/Booking";  // Import your Booking model
import type { UserType } from "~/models/User"; 

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

  // Fetch bookings made by the user, sorted by startDate ascending
  const bookings = await Booking.find({ user: authUserId })
    .sort({ startDate: 1 })
    .lean();

  return { user, bookings };
}

export async function action({ request }) {
  // Get the session
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  // Destroy the session and redirect to the signin page
  return redirect("/", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
}

export default function Profile() {
  const { user, bookings } = useLoaderData() as { user: UserType; bookings: any[] };

  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-500">Profil</h1>
      <p>Brúkara Info</p>

      <section className="flex flex-col items-center text-center w-full mb-8">
        <div className="flex flex-row justify-between items-center w-full mb-12">
          <span className="w-[25px]"></span>
          <h1 className="font-serif text-2xl font-medium text-left text-[#48302D]">
            My Profile
          </h1>
           <Link to="/profile/update">
            edit profile
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-medium text-[#48302D]">{user.name}</h1>
          <p className="text-[#48302D]">{user.mail}</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#48302D]">Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-[#48302D]">No bookings found.</p>
        ) : (
          <ul className="space-y-4 text-[#48302D]">
            {bookings.map((booking) => (
              <li key={booking._id} className="border border-[#48302D] rounded p-4">
                <p>
                  <strong>Start Date:</strong>{" "}
                  {new Date(booking.startDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {new Date(booking.endDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Plate Number:</strong> {booking.plateNumber ?? "None"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Form method="post" className="mt-8">
        <button className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600">
          Logout
        </button>
      </Form>
    </>
  );
}
