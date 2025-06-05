import { Link, redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import type { Route } from "./+types/home";
import { sessionStorage } from "~/services/session.server"; // adjust path to your file
import Booking from "~/models/Booking";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BNB" }
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const authUserId = session.get("authUserId");

  if (!authUserId) {
    throw redirect("/signin");
  }

  const url = new URL(request.url);
  const bookingId = url.searchParams.get("bookingId");

  if (!bookingId) throw redirect("/");

  const booking = await Booking.findById(bookingId)
    .populate("user", "name email")
    .lean();

  if (!booking) {
    throw redirect("/");
  }

  return { booking };
}


export default function Confirm() {
  const { booking } = useLoaderData() as {
    booking: {
      plateNumber?: string;
      startDate: string;
      endDate: string;
      user: { name: string; email?: string };
      room?: { title: string; description?: string };
    };
  };

  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-500">Confirmation</h1>
      <p>Info</p>
      <p>Kvittering-ish</p>

      <p>
        <strong>Booking for:</strong> {booking.user.name}
      </p>
      <p>
        <strong>Dates:</strong>{" "}
        {new Date(booking.startDate).toLocaleDateString()} -{" "}
        {new Date(booking.endDate).toLocaleDateString()}
      </p>
      <p>
        <strong>Plate Number:</strong> {booking.plateNumber ?? "None"}
      </p>

      <Link to="/profile">see booking</Link>
    </>
  );
}