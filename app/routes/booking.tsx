import {
  data,
  Form,
  redirect,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router";

import Room, { type RoomType } from "~/models/Room";
import User from "~/models/User";
import Booking from "~/models/Booking";
import mongoose from "mongoose";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateField } from "@mui/x-date-pickers/DateField";
import { da } from "date-fns/locale";

import Hero from "~/assest/room.jpg";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import { PiHouseLineDuotone } from "react-icons/pi";
import { AiTwotoneMail } from "react-icons/ai";

import { useState } from "react";
import TextField from "@mui/material/TextField";

export function meta() {
  return [{ title: "BNB" }];
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Server-only imports here
  const { getSession, sessionStorage } = await import(
    "~/services/session.server"
  );

  const session = await getSession(request.headers.get("Cookie"));
  const authUserId = session.get("authUserId");

  if (!authUserId) {
    throw redirect("/signin");
  }

  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");

  const user = await User.findById(authUserId).lean();
  const rooms = await Room.find().lean();

  return { rooms, start, end, user };
}

export async function action({ request }: LoaderFunctionArgs) {
  // Server-only imports here too
  const { getSession } = await import("~/services/session.server");

  const formData = await request.formData();
  const plateNumber = formData.get("plateNumber");
  const start = formData.get("start");
  const end = formData.get("end");
  const selectedPackage = formData.get("package");
  const acceptTerms = formData.get("acceptTerms");
  const notes = formData.get("notes");

  const session = await getSession(request.headers.get("cookie"));
  const authUserId = session.get("authUserId");

  if (!authUserId) return redirect("/signin");

  const errors: Record<string, { message: string }> = {};

  if (!acceptTerms) {
    errors.acceptTerms = {
      message: "You must accept the terms and conditions.",
    };
  }

  if (
    !plateNumber ||
    typeof plateNumber !== "string" ||
    plateNumber.trim() === ""
  ) {
    errors.plateNumber = { message: "Plate Number is required." };
  }

  if (!selectedPackage || typeof selectedPackage !== "string") {
    errors.package = { message: "Please select a package." };
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors });
  }

  try {
    const booking = await Booking.create({
      plateNumber,
      user: authUserId,
      startDate: start,
      endDate: end,
      package: selectedPackage,
      notes: typeof notes === "string" ? notes : undefined,
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

export default function BookingPage({ actionData }: { actionData?: any }) {
  const navigate = useNavigate();
  const { rooms, start, end, user } = useLoaderData() as {
    rooms: RoomType[];
    start: string | null;
    end: string | null;
    user: { _id: string; name: string };
  };

  const [bringingCar, setBringingCar] = useState("no");
  const [selectedPackage, setSelectedPackage] = useState("bed+room"); // default package

  const errors = actionData?.errors || {};

  function handleCancel() {
    navigate(-1);
  }

  // Calculate nights between start and end dates
  const nights =
    start && end
      ? Math.ceil(
          (new Date(end).getTime() - new Date(start).getTime()) /
            (1000 * 3600 * 24)
        )
      : 0;

  return (
    <>
      <section className="w-full h-110 overflow-hidden relative">
        <ParallaxProvider>
          <Parallax speed={-20}>
            <img src={Hero} className="w-full h-[81vh] object-cover" />
          </Parallax>
        </ParallaxProvider>
        <div className="bg-[rgb(244,235,223,0.7)] absolute z-20 bottom-0 left-10 w-90 h-50 p-8 flex flex-col gap-4">
          <h3 className="text-3xl text-[#22392c]"> Jonas' Bed n' Breakfast</h3>
          <p className="text-xl text-[#22392c] flex items-center gap-4">
            <PiHouseLineDuotone />
            Adresse
          </p>
          <p className="text-xl text-[#22392c] flex items-center gap-4">
            <AiTwotoneMail />
            Mail
          </p>
        </div>
      </section>

      <div className="flex justify-between items-start">
        <section className="p-8 w-[70%] space-y-6">
          <div className="border border-[#d6c9b3] p-6 bg-[#fffbee]">
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={da}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TextField
                  label="Guest"
                  value={user?.name ?? ""}
                  fullWidth
                  variant="outlined"
                />
                <DateField
                  label="Check In"
                  format="dd/MM/yyyy"
                  value={start ? new Date(start) : null}
                  readOnly
                  fullWidth
                />
                <DateField
                  label="Check Out"
                  format="dd/MM/yyyy"
                  value={end ? new Date(end) : null}
                  readOnly
                  fullWidth
                />
              </div>
            </LocalizationProvider>
          </div>

          <Form method="post" className="space-y-6" id="bookingForm">
            <input type="hidden" name="start" value={start ?? ""} />
            <input type="hidden" name="end" value={end ?? ""} />

            <div className="border border-[#d6c9b3] p-6 bg-[#fffbee]">
              <div className="text-[#22392c]">
                <label className="block text-sm font-medium text-[#22392c] mb-2">
                  <h3 className="text-xl">Choose Package</h3>
                </label>
                <select
                  name="package"
                  required
                  className="border border-[#ccc] p-2 rounded-md w-full"
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                >
                  <option value="bed+room">Bed + Room</option>
                  <option value="maddress+room">Maddress + Room</option>
                  <option value="maddress">Maddress</option>
                </select>
              </div>
            </div>

            <div className="border border-[#d6c9b3] p-6 bg-[#fffbee]">
              <div>
                <label className="block text-sm font-medium text-[#22392c] mb-2">
                  <h3 className="text-xl">Are you bringing a car?</h3>
                </label>
                <div className="flex gap-6 text-[#22392c]">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="carOption"
                      value="no"
                      checked={bringingCar === "no"}
                      onChange={() => setBringingCar("no")}
                    />
                    No
                  </label>
                  <label className="flex items-center gap-2">
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

                {bringingCar === "yes" ? (
                  <div>
                    <label className="block text-sm font-medium text-[#22392c] mb-2">
                      Plate Number
                    </label>
                    <input
                      type="text"
                      name="plateNumber"
                      className={`w-full px-3 py-2 border rounded-md text-[#22392c] ${
                        errors.plateNumber ? "border-red-800" : "border-[#ccc]"
                      }`}
                    />
                    {errors.plateNumber && (
                      <p className="text-sm text-red-800 mt-1">
                        {errors.plateNumber.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <input type="hidden" name="plateNumber" value="No car" />
                )}
              </div>
            </div>
            <div className="border border-[#d6c9b3] p-6 bg-[#fffbee]">
              <label className="block text-sm font-medium text-[#48302D] mb-2">
                <h3 className="text-xl">Notes or special requests</h3>
              </label>
              <textarea
                name="notes"
                rows={4}
                className="w-full px-3 py-2 border border-[#ccc] rounded-md text-[#22392c]"
                placeholder="Add any notes here..."
              ></textarea>
            </div>
          </Form>
        </section>

        <section className="p-6 w-[30%] border border-[#d6c9b3] bg-[#fffbee] m-8 h-97.5 flex flex-col justify-between items-start">
          <div className="text-black">
            <h1 className="text-3xl">Basket</h1>
          </div>

          <div className="mt-4 space-y-2 text-[#22392c] w-full">
            <p>
              Number of nights:<strong> {nights}</strong>
            </p>
            <p>
              Selected package: <strong>{selectedPackage}</strong>
            </p>
            <p>
              Bringing a car:{" "}
              <strong> {bringingCar === "yes" ? "Yes" : "No"}</strong>
            </p>
          </div>

          <div className="flex flex-col justify-between mt-6 gap-3 w-full">
            <div className="mt-6">
              <label className="flex items-center gap-2 text-[#22392c]">
                <input type="checkbox" name="acceptTerms" form="bookingForm" />I
                accept the terms and conditions
              </label>
              {errors.acceptTerms && (
                <p className="text-sm text-red-800 mt-1">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              form="bookingForm"
              className="px-4 py-2 bg-[#22392c] text-[#f4ebdf]  hover:bg-[#1a2e25]"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2  bg-[#f4ebdf]  border border-[#d6c9b3] text-[#22392c] hover:bg-[#efe6da]"
            >
              Cancel
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
