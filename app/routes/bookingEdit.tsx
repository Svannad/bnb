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

  function overlaps(ranges: { startDate: string; endDate: string }[]): boolean {
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
    <div className="min-h-screen bg-[#f4f2f0] flex items-center justify-center px-4 py-10">
      <div className="border border-[#d6c9b3] p-6 bg-[#fffbee] w-[90%] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-serif text-[#48302D] mb-6 text-center">
          Edit Booking
        </h1>

        <Form method="post" className="space-y-6 w-[60%]">
          {/* Date pickers */}
          <div>
            <label className="block text-sm font-medium text-[#22392c] mb-2">
              Check-in Date
            </label>
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
              className="w-full px-3 py-2 border border-[#ccc] rounded-md text-[#22392c]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#22392c] mb-2">
              Check-out Date
            </label>
            <input
              type="date"
              name="end"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#ccc] rounded-md text-[#22392c]"
            />
          </div>

          {/* Car option */}
          <div>
            <label className="block text-sm font-medium text-[#22392c] mb-2">
              Are you bringing a car?
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-[#22392c]">
                <input
                  type="radio"
                  name="carOption"
                  value="no"
                  checked={bringingCar === "no"}
                  onChange={() => setBringingCar("no")}
                />
                No
              </label>
              <label className="flex items-center gap-2 text-[#22392c]">
                <input
                  type="radio"
                  name="carOption"
                  value="yes"
                  checked={bringingCar === "yes"}
                  onChange={() => setBringingCar("yes")}
                />
                Yes
              </label>
            </div>
          </div>

          {/* Plate number */}
          {bringingCar === "yes" && (
            <div>
              <label className="block text-sm font-medium text-[#22392c] mb-2">
                Plate Number
              </label>
              <input
                type="text"
                name="plateNumber"
                defaultValue={booking.plateNumber}
                className="w-full px-3 py-2 border border-[#ccc] rounded-md text-[#22392c]"
              />
              {errors.plateNumber && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.plateNumber.message}
                </p>
              )}
            </div>
          )}

          {/* Errors */}
          {errors.date && (
            <div className="text-red-600 font-medium">
              {errors.date.message}
            </div>
          )}
          {clientOverlap && (
            <div className="text-red-600 font-medium">
              Sorry, the selected dates are not available.
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 flex flex-col ">
            <button
              type="submit"
              className="px-4 py-2 bg-[#22392c] text-[#f4ebdf]  hover:bg-[#1a2e25]"
              disabled={clientOverlap}
            >
              Update Booking
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2  bg-[#f4ebdf]  border border-[#d6c9b3] text-[#22392c] hover:bg-[#efe6da]"
            >
              Cancel
            </button>
          </div>
        </Form>

        {/* Delete */}
        <Form method="post" className="mt-6 flex flex-col w-[60%]">
          <input type="hidden" name="_method" value="delete" />
          <button
            type="submit"
            className="px-4 py-2 bg-red-800 text-[#f4ebdf]  hover:bg-red-800/80"
            onClick={(e) => {
              if (!confirm("Are you sure you want to delete this booking?"))
                e.preventDefault();
            }}
          >
            Delete Booking
          </button>
        </Form>
      </div>
    </div>
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
