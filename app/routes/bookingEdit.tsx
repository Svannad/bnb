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
import Unavailable from "~/models/Unavailable";
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
  if (!authUserId) throw redirect("/signin");

  const id = String(params.id);
  if (!id) throw new Response("Booking ID is required", { status: 400 });

  const booking = await Booking.findById(id).lean();
  if (!booking) throw new Response("Booking not found", { status: 404 });

  // Load other bookings and unavailable ranges
  const bookings = await Booking.find({ _id: { $ne: id } }).lean();
  const unavailables = await Unavailable.find({}).lean();

  return {
    booking: {
      ...booking,
      startDateFormatted: formatDateForInput(booking.startDate),
      endDateFormatted: formatDateForInput(booking.endDate),
    },
    bookings,
    unavailables,
  };
}

export default function BookingEdit({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const errors = actionData?.errors || {};
  const { booking, bookings, unavailables } = useLoaderData() as {
    booking: any;
    bookings: { startDate: string; endDate: string }[];
    unavailables: { startDate: string; endDate: string }[];
  };

  const [startDate, setStartDate] = useState(booking.startDateFormatted);
  const [endDate, setEndDate] = useState(booking.endDateFormatted);
  const [bringingCar, setBringingCar] = useState(
    booking.carOption === "yes" ? "yes" : "no"
  );

  function getToday() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  function overlaps(
    ranges: { startDate: string; endDate: string }[]
  ): boolean {
    const rs = new Date(startDate);
    const re = new Date(endDate);
    return ranges.some(({ startDate, endDate }) => {
      const a = new Date(startDate);
      const b = new Date(endDate);
      return rs <= b && a <= re;
    });
  }

  const clientOverlap = overlaps(bookings) || overlaps(unavailables);

  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-500">
        Edit Booking
      </h1>
      <Form method="post" className="space-y-4 w-full">
        <input
          type="date"
          name="start"
          value={startDate}
          min={getToday()}
          onChange={(e) => {
            const s = e.target.value;
            setStartDate(s);
            if (endDate < s) setEndDate(s);
          }}
        />
        <input
          type="date"
          name="end"
          value={endDate}
          min={startDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

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

        {bringingCar === "yes" && (
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
        )}

        {errors.date && (
          <div className="text-red-500 font-bold mb-4">{errors.date.message}</div>
        )}
        {clientOverlap && (
          <div className="text-red-500 font-bold mb-4">
            Sorry, the selected dates are not available.
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-[#48302D] text-[#F4F2F0] rounded-md hover:opacity-80"
          disabled={clientOverlap}
        >
          Update Booking
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full py-2 px-4 border border-[#48302D] text-[#48302D] rounded-md hover:opacity-80"
        >
          Cancel
        </button>
      </Form>

      <Form method="post" className="mt-4">
        <input type="hidden" name="_method" value="delete" />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:opacity-80"
          onClick={(e) => {
            if (!confirm("Are you sure?")) e.preventDefault();
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
  if (!authUserId) throw redirect("/signin");

  const formData = await request.formData();
  const method = formData.get("_method");
  const carOption = formData.get("carOption");
  const plateNumber = formData.get("plateNumber");
  const start = formData.get("start");
  const end = formData.get("end");

  if (method === "delete") {
    await Booking.deleteOne({ _id: params.id });
    return redirect("/profile");
  }

  const startDateISO = new Date(start + "T00:00:00Z");
  const endDateISO = new Date(end + "T00:00:00Z");

  if (
    carOption === "yes" &&
    (!plateNumber || typeof plateNumber !== "string" || !plateNumber.trim())
  ) {
    return {
      errors: {
        plateNumber: {
          message: "Plate number is required if bringing a car",
        },
      },
    };
  }

  const otherBookings = await Booking.find({
    _id: { $ne: params.id },
  }).lean();
  const unavailables = await Unavailable.find({}).lean();

  const ranges = [...otherBookings, ...unavailables];
  
  const sn = startDateISO;
  const en = endDateISO;
  const conflict = ranges.some((r) => {
    const a = new Date(r.startDate);
    const b = new Date(r.endDate);
    return sn <= b && a <= en;
  });

  if (conflict) {
    return {
      errors: {
        date: { message: "Sorry, the selected dates are not available." },
      },
    };
  }

  await Booking.updateOne(
    { _id: params.id },
    {
      $set: {
        startDate: startDateISO.toISOString(),
        endDate: endDateISO.toISOString(),
        carOption,
        plateNumber,
      },
    }
  );

  return redirect("/profile");
}
