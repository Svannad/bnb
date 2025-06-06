import {
  Form,
  redirect,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router";
import type { Route } from "./+types/home";
import { useState } from "react";
import Booking from "~/models/Booking";
import { sessionStorage } from "~/services/session.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "BNB" }];
}

function formatDateForInput(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const authUserId = session.get("authUserId");

  if (!authUserId) {
    throw redirect("/signin");
  }

  const id = String(params.id);

  if (!id) {
    throw new Response("Booking ID is required", { status: 400 });
  }

  const booking = await Booking.findOne().lean();
  if (!booking) throw new Response("Booking not found", { status: 404 });

  return {
    booking: {
      ...booking,
      startDateFormatted: formatDateForInput(booking.startDate),
      endDateFormatted: formatDateForInput(booking.endDate),
    },
  };
}

export default function BookingEdit({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const errors = actionData?.errors || {};
  const { booking } = useLoaderData() as { booking: any };

  // State to hold start and end dates (strings formatted yyyy-mm-dd)
  const [startDate, setStartDate] = useState(booking.startDateFormatted);
  const [endDate, setEndDate] = useState(booking.endDateFormatted);

  const [bringingCar, setBringingCar] = useState(
    booking.carOption === "yes" ? "yes" : "no"
  );

  // Get today's date formatted yyyy-mm-dd for min attribute
  function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function handleCancel() {
    navigate(-1);
  }

  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-500">Edit Booking</h1>
      <Form method="post" className="space-y-4 w-full">
        <input
          type="date"
          name="start"
          value={startDate}
          min={getToday()} // No past dates allowed
          onChange={(e) => {
            const newStart = e.target.value;
            setStartDate(newStart);
            // If current end date is before new start, reset end date to new start
            if (endDate < newStart) {
              setEndDate(newStart);
            }
          }}
        />
        <input
          type="date"
          name="end"
          value={endDate}
          min={startDate} // Can't pick end date before start date
          onChange={(e) => setEndDate(e.target.value)}
        />

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
              defaultValue={booking.plateNumber}
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

        {errors.date && (
          <div className="text-red-500 font-bold mb-4">{errors.date.message}</div>
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-[#48302D] text-[#F4F2F0] rounded-md cursor-pointer hover:opacity-80"
        >
          Update Booking
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="w-full py-2 px-4 border border-[#48302D] text-[#48302D] rounded-md cursor-pointer hover:opacity-80"
        >
          Cancel
        </button>
      </Form>
      <Form method="post" className="mt-4">
        <input type="hidden" name="_method" value="delete" />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:opacity-80"
          onClick={(event) => {
            if (
              !confirm(
                "Are you sure you want to delete this booking? This action cannot be undone."
              )
            ) {
              event.preventDefault(); // Now event is defined!
            }
          }}
        >
          Delete Booking
        </button>
      </Form>
    </>
  );
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const authUserId = session.get("authUserId");

  if (!authUserId) {
    throw redirect("/signin");
  }

  const formData = await request.formData();
  const method = formData.get("_method");
  const carOption = formData.get("carOption");
  const plateNumber = formData.get("plateNumber");
  const start = formData.get("start");
  const end = formData.get("end");

  if (method === "delete") {
    // Handle delete request
    await Booking.deleteOne({ _id: params.id});
    return redirect("/profile"); // or wherever you want to go after delete
  }

  const startDateISO = start
    ? new Date(start + "T00:00:00Z").toISOString()
    : null;
  const endDateISO = end ? new Date(end + "T00:00:00Z").toISOString() : null;

  // Validate plate number if bringing car
  if (
    carOption === "yes" &&
    (!plateNumber || typeof plateNumber !== "string" || !plateNumber.trim())
  ) {
    return {
      errors: {
        plateNumber: { message: "Plate number is required if bringing a car" },
      },
    };
  }

  // 1. Fetch all other bookings (exclude current booking by ID)
  const existingBookings = await Booking.find({
    _id: { $ne: params.id }, // exclude current booking itself
    // optional: add user: authUserId if you want to limit to user's own bookings
  }).lean();

  // 2. Check overlap
  const requestedStart = new Date(startDateISO!);
  const requestedEnd = new Date(endDateISO!);

  const overlap = existingBookings.some((booking) => {
    const existingStart = new Date(booking.startDate);
    const existingEnd = new Date(booking.endDate);

    // Overlap condition:
    return requestedStart <= existingEnd && existingStart <= requestedEnd;
  });

  if (overlap) {
    return {
      errors: {
        date: {
          message: "The selected dates overlap with an existing booking.",
        },
      },
    };
  }

  // 3. If no overlap, update the booking
  await Booking.updateOne(
    { _id: params.id },
    {
      $set: {
        startDate: startDateISO,
        endDate: endDateISO,
        carOption,
        plateNumber,
      },
    }
  );

  return redirect("/profile");
}
