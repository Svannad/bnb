import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import type { Route } from "./+types/home";
import { sessionStorage } from "~/services/session.server";
import Booking from "~/models/Booking";
import User from "~/models/User";

export function meta({}: Route.MetaArgs) {
  return [{ title: "BNB" }];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  const authUserId = session.get("authUserId");

  if (!authUserId) {
    throw redirect("/signin");
  }

  // Fetch all bookings sorted by startDate ascending
  // Populate the 'user' field to get user info (like name)
  const bookings = await Booking.find({})
    .sort({ startDate: 1 })
    .populate("user", "name") // Only fetch the 'name' field from the user
    .lean();

  return { bookings };
}

export default function Dashboard() {
  const { bookings } = useLoaderData() as { bookings: any[] };

  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-500 mb-6">Dashboard</h1>
      <p className="mb-4">Bookings - redigera bookings</p>
      <p className="mb-4">Redigera kamar info</p>
      <p className="mb-8">Redigera Availability</p>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#48302D]">All Bookings</h2>
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <ul className="space-y-4 text-[#48302D]">
            {bookings.map((booking) => (
              <li key={booking._id} className="border border-[#48302D] rounded p-4">
                <p>
                  <strong>User:</strong>{" "}
                  {booking.user?.name ?? "Unknown user"}
                </p>
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
    </>
  );
}
