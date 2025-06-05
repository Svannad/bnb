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

export default function BookingPage({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { rooms, start, end, user } = useLoaderData() as {
    rooms: RoomType[];
    start: string | null;
    end: string | null;
    user: { _id: string; name: string };
  };

  function handleCancel() {
    navigate(-1);
  }

  const errors = actionData?.errors || {};

  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-500">Booking</h1>

      {/* Display selected dates */}
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
        {/* Hidden inputs for dates */}
        <input type="hidden" name="start" value={start ?? ""} />
        <input type="hidden" name="end" value={end ?? ""} />

        <div className="flex justify-between items-start flex-col w-full">
          <label className="block text-sm text-[#48302D]">Plate Number</label>
          <input
            type="text"
            name="plateNumber"
            className={`mt-1 block w-full px-3 py-2 border rounded-md mb-6 text-[#48302D] ${
              errors.name ? "border-red-500" : "border-[#48302D]"
            }`}
          />
          {errors.name && (
            <span className="text-sm text-red-500">{errors.name.message}</span>
          )}
        </div>
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
