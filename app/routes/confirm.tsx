import {
  Link,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router";
import type { Route } from "./+types/home";
import { sessionStorage } from "~/services/session.server"; // adjust path to your file
import Booking from "~/models/Booking";
import { Parallax, ParallaxProvider } from "react-scroll-parallax";
import { PiHouseLineDuotone } from "react-icons/pi";
import { AiTwotoneMail } from "react-icons/ai";
import Hero from "~/assest/room.jpg";

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
      package?: string;
      notes?: string;
    };
  };

  return (
    <>
      <section className="w-full h-70 overflow-hidden relative">
        <ParallaxProvider>
          <Parallax speed={-20}>
            <img src={Hero} className="w-full h-[90vh] object-cover object-bottom" />
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

      <section className="flex flex-col gap-4 m-8">
        <div className="border border-[#d6c9b3] p-6 bg-[#fffbee]">
          <div>
            <h1 className="text-4xl font-bold text-[#22392c] mb-2">
              Thank you, {booking.user.name}!
            </h1>
            <p className="text-lg text-[#48302D]">
              Your booking has been confirmed 
            </p>
          </div>
        </div>
        <div className="border border-[#d6c9b3] p-6 bg-[#fffbee] text-[#48302D]">
          <div className="space-y-3">
            <p>
              <strong>Dates:</strong>{" "}
              {new Date(booking.startDate).toLocaleDateString()} –{" "}
              {new Date(booking.endDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Plate Number:</strong> {booking.plateNumber ?? "None"}
            </p>
            <p>
              <strong>Package:</strong> {booking.package ?? "N/A"}
            </p>
            {booking.notes && (
              <p>
                <strong>Notes:</strong> {booking.notes}
              </p>
            )}
          </div>

          <div className="flex justify-start pt-4 gap-4 mt-12">
            <Link
              to="/profile"
              className="px-4 py-2 bg-[#22392c] text-[#f4ebdf]  hover:bg-[#1a2e25]"
            >
              View Booking
            </Link>
            <Link
              to="/"
              className="px-4 py-2  bg-[#f4ebdf]  border border-[#d6c9b3] text-[#22392c] hover:bg-[#efe6da]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
