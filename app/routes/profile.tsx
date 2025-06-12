import { Form, Link, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { getSession, sessionStorage } from "~/services/session.server";
import User from "~/models/User";
import Booking from "~/models/Booking"; // Import your Booking model
import type { UserType } from "~/models/User";
import { IoPersonCircleOutline } from "react-icons/io5";
import { AiOutlineMail } from "react-icons/ai";
import { MdPhone } from "react-icons/md";

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

  const bookings = await Booking.find({
    user: authUserId,
  })
    .sort({ startDate: 1 })
    .lean();

  return { bookings: JSON.parse(JSON.stringify(bookings)), user };
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
  const { user, bookings } = useLoaderData() as {
    user: UserType;
    bookings: any[];
  };

  return (
    <div className="min-h-screen bg-[#fffbee] px-8 py-10 text-[#22392c] space-y-10">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">
          Welcome back, {user.name}
        </h1>
        <p className="text-[#758d7e]   text-sm">
          Manage your profile and keep track of your bookings. Ready for your
          next stay?
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Section */}
        <section className="w-full md:w-[40%] border border-[#d6c9b3] p-6 bg-[#fffbee] space-y-6 flex flex-col justify-between items-start">
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold">My Profile</h2>
            <p className="text-[#22392c] flex gap-2 items-center text-lg">
              <IoPersonCircleOutline size={30} color="#758d7e" />
              {user.name}
            </p>
            <p className="text-[#22392c] flex gap-2 items-center text-lg pl-[2px]">
              <AiOutlineMail size={27} color="#758d7e" />
              {user.mail}
            </p>
            <p className="text-[#22392c] flex gap-2 items-center text-lg pl-[2px]">
              <MdPhone size={28} color="#758d7e" />
              {user.phone}
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <Link
              to="/profile/update"
              className="px-4 py-2  bg-[#f4ebdf]  border border-[#d6c9b3] text-[#22392c] hover:bg-[#efe6da] text-center"
            >
              Edit Profile
            </Link>

            <Form method="post">
              <button className="w-full py-2 px-4 bg-red-800 text-white hover:bg-red-900 transition">
                Logout
              </button>
            </Form>
          </div>
        </section>

        {/* Bookings Section */}
        <section className="w-full md:w-[60%] border border-[#d6c9b3] p-6 bg-[#fffbee]">
          <h2 className="text-2xl font-semibold mb-2">Bookings</h2>
          <p className="mb-6 text-sm text-[#758d7e] ">
            These are your current or upcoming bookings.
          </p>

          {bookings.length === 0 ? (
            <p className="text-[#22392c] italic">
              You haven’t made any bookings yet.
            </p>
          ) : (
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <ul className="space-y-4">
                {bookings
                  .filter(
                    (booking) =>
                      new Date(booking.startDate) >=
                      new Date(new Date().setHours(0, 0, 0, 0))
                  )
                  .map((booking) => (
                    <li
                      key={booking._id}
                      className="bg-[#f4ebdf] border border-[#d6c9b3] p-4 rounded hover:bg-white transition"
                    >
                      <Link
                        to={`/booking/${booking._id}/update`}
                        className="block text-left space-y-1"
                      >
                        <p>
                          <strong>Dates:</strong>{" "}
                          {new Date(booking.startDate).toLocaleDateString()} –{" "}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Plate:</strong>{" "}
                          {booking.plateNumber ?? "None"}
                        </p>
                        {booking.notes && (
                          <p>
                            <strong>Notes:</strong> {booking.notes}
                          </p>
                        )}
                        <p className="text-sm underline text-[#22392c] mt-2">
                          Edit booking
                        </p>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
