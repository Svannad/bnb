import { useState } from "react";
import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import Booking from "~/models/Booking";
import { sessionStorage } from "~/services/session.server";
import Unavailable from "~/models/Unavailable";
import Hero from "~/assest/room.jpg";
import Service from "~/assest/service.jpg";
import Events from "~/assest/events.jpg";
import Rest from "~/assest/rest.jpg";
import Detail from "~/assest/detail.jpg";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const authUserId = session.get("authUserId");

  const bookings = await Booking.find({}).sort({ startDate: 1 }).lean();
  const unavailables = await Unavailable.find({}).lean();

  return { bookings, unavailables, authUserId };
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

  const { bookings, unavailables, authUserId } = useLoaderData() as {
    bookings: Booking[];
    unavailables: { startDate: string; endDate: string }[];
    authUserId: string | null;
  };

  function checkAvailability() {
    if (!startDate || !endDate) return;

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    const overlaps = (ranges: { startDate: string; endDate: string }[]) =>
      ranges.some(({ startDate, endDate }) => {
        const rangeStart = new Date(startDate);
        const rangeEnd = new Date(endDate);
        return requestedStart <= rangeEnd && rangeStart <= requestedEnd;
      });

    const bookingOverlap = overlaps(bookings);
    const unavailableOverlap = overlaps(unavailables);

    if (bookingOverlap || unavailableOverlap) {
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
      <section className="relative min-h-[100vh] flex items-center justify-end pr-16 mt-[-88px]">
        <img
          src={Hero}
          alt="Hero background"
          className="absolute inset-0 w-full h-[100vh] object-cover z-0"
        />
        <div className="relative z-20 bg-[#f4ebdf] p-6 text-[#22392c] max-w-md w-full flex flex-col items-center justify-center gap-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <label htmlFor="start">
              Ankommer
              <input
                type="date"
                name="start"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full p-2 rounded border mt-1"
              />
            </label>
            <label htmlFor="end">
              Afrejse
              <input
                type="date"
                name="end"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full p-2 rounded border mt-1"
              />
            </label>
          </div>
          <button
            onClick={checkAvailability}
            className="px-4 py-2 bg-[#22392c] text-[#f4ebdf]  hover:bg-[#1a2e25] w-full"
          >
            Check Dates
          </button>

          {notAvailable && (
            <div className="text-red-600 font-bold">
              Sorry, the selected dates are not available.
            </div>
          )}
        </div>
      </section>
      <section className="grid grid-cols-3 grid-rows-2 h-[600px]">
        <div className="h-full">
          <img
            src={Service}
            alt="Service"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="h-full">
          <img
            src={Events}
            alt="Events"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="row-span-2 bg-[#22392c] text-white flex items-center justify-center text-2xl font-semibold h-full">
          Your Text or Content Here
        </div>
        <div className="h-full">
          <img src={Rest} alt="Rest" className="w-full h-full object-cover" />
        </div>
        <div className="h-full">
          <img
            src={Detail}
            alt="Detail"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
      <section className="py-12 px-20 min-h-[80vh] flex flex-col justify-center items-start">
        <h1 className="font-serif text-4xl text-[#22392c]">
          Lorem ipsum dolor sit amet.
        </h1>
        <br />
        <p className=" text-[#22392c]">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempore,
          fugit, provident ut totam, commodi modi perspiciatis eligendi nam
          ratione reiciendis illo quo dolorem eos obcaecati laborum ullam sunt
          nesciunt velit eaque similique id dicta vel eius cum. Quod assumenda
          officia velit. Voluptate laboriosam facilis provident delectus labore
          facere non praesentium amet mollitia commodi doloribus suscipit ullam
          fugiat, hic dolorum, obcaecati rerum maiores totam accusantium animi,
          at aspernatur officia fugit doloremque? Modi eos deleniti magnam
          consectetur corporis commodi perspiciatis eaque consequatur!
        </p>
        <br />
        <p className=" text-[#22392c]">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque itaque
          laboriosam vitae fugiat architecto eos perspiciatis voluptates quia
          minima sit id praesentium possimus explicabo reprehenderit et, numquam
          aut. Debitis quia quo ullam soluta quaerat. Vitae ducimus quia
          accusantium neque, id dolor quam possimus dolorum minus. Ipsa amet
          error sequi quisquam.
        </p>
        <br />
        <p className=" text-[#22392c]">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempore,
          fugit, provident ut totam, commodi modi perspiciatis eligendi nam
          ratione reiciendis illo quo dolorem eos obcaecati laborum ullam sunt
          nesciunt velit eaque similique id dicta vel eius cum. Quod assumenda
          officia velit. Voluptate laboriosam facilis provident delectus labore
          facere non praesentium amet mollitia commodi doloribus suscipit ullam
          fugiat, hic dolorum, obcaecati rerum maiores totam accusantium animi,
          at aspernatur officia fugit doloremque? Modi eos deleniti magnam
          consectetur corporis commodi perspiciatis eaque consequatur!
        </p>
      </section>
    </>
  );
}
