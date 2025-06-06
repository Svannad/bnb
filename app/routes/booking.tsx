import {
  data,
  Form,
  redirect,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router";
import type { Route } from "./+types/home";
import { getSession, sessionStorage } from "~/services/session.server";
import Room, { type RoomType } from "~/models/Room";
import User from "~/models/User";
import Booking from "~/models/Booking";
import mongoose from "mongoose";

export function meta({}: Route.MetaArgs) {
  return [{ title: "BNB" }];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const authUserId = session.get("authUserId");

  if (!authUserId) {
    throw redirect("/signin");
  }

  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");

  const user = await User.findById(authUserId).lean(); // fetch user

  const rooms = await Room.find().lean();

  return { rooms, start, end, user };
}

import { useState } from "react";

export default function BookingPage({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { rooms, start, end, user } = useLoaderData() as {
    rooms: RoomType[];
    start: string | null;
    end: string | null;
    user: { _id: string; name: string };
  };

  const [bringingCar, setBringingCar] = useState("no");
  const errors = actionData?.errors || {};

  function handleCancel() {
    navigate(-1);
  }

  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-500">Booking</h1>

      {start && end && (
        <p className="mb-4 text-[#48302D]">
          Selected dates: <strong>{start}</strong> to <strong>{end}</strong>
        </p>
      )}
      {user && (
        <p className="mb-4 text-[#48302D]">
          Booking for: <strong>{user.name}</strong>
        </p>
      )}
      {rooms.map((room) => (
        <p key={room._id}>
          <strong>{room.title}</strong> - {room.description || "No description"}
        </p>
      ))}

      <Form method="post" className="space-y-4 w-full">
        <input type="hidden" name="start" value={start ?? ""} />
        <input type="hidden" name="end" value={end ?? ""} />

        {/* Bringing a car? */}
        <div className="mb-4">
          <label className="block text-sm text-[#48302D] mb-2">
            Are you bringing a car?
          </label>
          <div className="flex gap-4">
             <label>
              <input
                type="radio"
                name="carOption"
                value="no"
                checked={bringingCar === "no"}
                onChange={() => setBringingCar("no")}
              />{" "}
              No
            </label>
            <label>
              <input
                type="radio"
                name="carOption"
                value="yes"
                checked={bringingCar === "yes"}
                onChange={() => setBringingCar("yes")}
              />{" "}
              Yes
            </label>
          </div>
        </div>

        {/* Plate Number Input */}
        {bringingCar === "yes" ? (
          <div className="flex flex-col w-full">
            <label className="text-sm text-[#48302D]">Plate Number</label>
            <input
              type="text"
              name="plateNumber"
              className={`mt-1 block w-full px-3 py-2 border rounded-md mb-6 text-[#48302D] ${
                errors.plateNumber ? "border-red-500" : "border-[#48302D]"
              }`}
            />
            {errors.plateNumber && (
              <span className="text-sm text-red-500">
                {errors.plateNumber.message}
              </span>
            )}
          </div>
        ) : (
          <input type="hidden" name="plateNumber" value="No car" />
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-[#48302D] text-[#F4F2F0] rounded-md cursor-pointer hover:opacity-80"
        >
          Create Booking
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="w-full py-2 px-4 border border-[#48302D] text-[#48302D] rounded-md cursor-pointer hover:opacity-80"
        >
          Cancel
        </button>
      </Form>
    </>
  );
}


export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const plateNumber = formData.get("plateNumber");
  const start = formData.get("start");
  const end = formData.get("end");

  const session = await getSession(request.headers.get("cookie"));
  const authUserId = session.get("authUserId");

  if (!authUserId) {
    return redirect("/signin");
  }

  if (!plateNumber || typeof plateNumber !== "string" || plateNumber.trim() === "") {
    return data({
      errors: {
        plateNumber: { message: "Plate Number is required" },
      },
    });
  }

  try {
    const booking = await Booking.create({
      plateNumber,
      user: authUserId,
      startDate: start,
      endDate: end,
    });

    return redirect(`/confirm?bookingId=${booking._id.toString()}`);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return data({ errors: error.errors });
    }
    console.error("Unexpected error:", error);
    return data({
      errors: {
        general: { message: "An unexpected error occurred" },
      },
    });
  }
}
