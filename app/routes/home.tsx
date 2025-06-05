import { useState } from "react";
import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";

// home.tsx or home.jsx
import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import Booking from "~/models/Booking";
import { sessionStorage } from "~/services/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const authUserId = session.get("authUserId");

  const bookings = await Booking.find({}).sort({ startDate: 1 }).lean();

  return { bookings, authUserId }; // ← include auth info
}



export function meta({}: Route.MetaArgs) {
  return [{ title: "BNB" }];
}

type Booking = {
  startDate: string;
  endDate: string;
};

export default function Home() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notAvailable, setNotAvailable] = useState(false);
  const navigate = useNavigate();

  const { bookings, authUserId } = useLoaderData() as {
    bookings: Booking[];
    authUserId: string | null;
  };

  function checkAvailability() {
    if (!startDate || !endDate) return;

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    const overlap = bookings.some((booking) => {
      const existingStart = new Date(booking.startDate);
      const existingEnd = new Date(booking.endDate);

      return requestedStart <= existingEnd && existingStart <= requestedEnd;
    });

    if (overlap) {
      setNotAvailable(true);
    } else {
      setNotAvailable(false);
      if (!authUserId) {
        navigate("/signin");
      } else {
        navigate(`/booking?start=${startDate}&end=${endDate}`);
      }
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-500">Forsíða</h1>
      <p>Hero Section</p>
      <p>Velja Dato</p>
      <br />
      <br />
      <section>
        <label htmlFor="start">
          Start Date <br />
          <input
            type="date"
            name="start"
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <br />
        <br />
        <label htmlFor="end">
          End Date <br />
          <input
            type="date"
            name="end"
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </section>
      <button
        onClick={checkAvailability}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Check Dates
      </button>

      {notAvailable && (
        <div className="mt-4 text-red-600 font-bold">
          Sorry, the selected dates are not available.
        </div>
      )}
    </>
  );
}