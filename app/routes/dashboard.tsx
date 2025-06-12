import {
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  Link,
} from "react-router";
import type { Route } from "./+types/home";
import { sessionStorage } from "~/services/session.server";
import Booking from "~/models/Booking";
import Room from "~/models/Room"; // <- import Room model
import Unavailability from "~/models/Unavailable";

export function meta({}: Route.MetaArgs) {
  return [{ title: "BNB" }];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const authUserId = session.get("authUserId");

  if (!authUserId) {
    throw redirect("/signin");
  }

  // Fetch the one room (assuming only one)
  const room = await Room.findOne({}).lean();

  if (room && room._id) {
    room._id = room._id.toString(); // <-- convert _id to string here!
  }

  // Fetch all bookings sorted by startDate ascending, populate user name
  const bookings = await Booking.find({})
    .sort({ startDate: 1 })
    .populate("user", "name")
    .lean();

  const unavailableDates = await Unavailability.find().lean();

  return {
    room,
    bookings: JSON.parse(JSON.stringify(bookings)),
    unavailableDates,
  };
}

export default function Dashboard() {
  const { room, bookings, unavailableDates } = useLoaderData() as {
    room: any;
    bookings: any[];
    unavailableDates: any[];
  };

  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-500 mb-6">
        Dashboard
      </h1>

      {/* ROOM INFO */}
      {room ? (
        <section className="mb-10 border border-[#48302D] rounded p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#48302D]">
            Room Info
          </h2>
          <p>
            <strong>Name:</strong> {room.title}
          </p>
          <p>
            <strong>Description:</strong> {room.description ?? "No description"}
          </p>

          {/* Link to edit room */}
          <Link
            to={`/dashboard/${room._id.toString()}/update`}
            className="mt-4 inline-block px-4 py-2 bg-[#48302D] text-[#F4F2F0] rounded hover:opacity-80"
          >
            Edit Room
          </Link>
        </section>
      ) : (
        <p>No room found.</p>
      )}

      <ul>
        <Link to="/dashboard/unavailable">Edit Unavailable</Link>
        {unavailableDates.map(({ _id, startDate, endDate, reason }) => (
          <li key={_id} className="mb-2 flex items-center justify-between">
            <span>
              {new Date(startDate).toLocaleDateString()} -{" "}
              {new Date(endDate).toLocaleDateString()} {reason && `(${reason})`}
            </span>
          </li>
        ))}
      </ul>

      {/* BOOKINGS */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#48302D]">Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-[#48302D]">No bookings found.</p>
        ) : (
          <ul className="space-y-4 text-[#48302D]">
            {bookings
              .filter(
                (booking) =>
                  new Date(booking.startDate) >=
                  new Date(new Date().setHours(0, 0, 0, 0))
              )
              .map((booking) => (
                <li
                  key={booking._id}
                  className="border border-[#48302D] rounded p-4 hover:bg-[#f8f5f3] transition"
                >
                  <Link
                    to={`/booking/${booking._id}/update`}
                    className="block text-left"
                  >
                    <p>
                      <strong>Booked by:</strong>{" "}
                      {booking.user?.name ?? "Unknown"}
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
                      <strong>Plate Number:</strong>{" "}
                      {booking.plateNumber ?? "None"}
                    </p>
                    <p className="text-sm underline text-[#48302D] mt-2">
                      Edit booking
                    </p>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </section>
    </>
  );
}
