import React, { useState } from "react";
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
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import { da } from "date-fns/locale";

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
  const [value, setValue] = React.useState<Dayjs | null>(null);
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [notAvailable, setNotAvailable] = useState(false);
  const navigate = useNavigate();

  const { bookings, unavailables, authUserId } = useLoaderData() as {
    bookings: Booking[];
    unavailables: { startDate: string; endDate: string }[];
    authUserId: string | null;
  };

  function checkAvailability() {
    if (!startDate || !endDate) return;

    const overlaps = (ranges: { startDate: string; endDate: string }[]) =>
      ranges.some(({ startDate: s, endDate: e }) => {
        const rangeStart = new Date(s);
        const rangeEnd = new Date(e);
        return startDate <= rangeEnd && rangeStart <= endDate;
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
        navigate(
          `/booking?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
        );
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
        <div className="absolute bottom-30 left-17 text-[#f4ebdf] ">
          <h1 className="text-6xl">Jonas's Bed n' Breafast</h1>
          <p className="text-3xl">
            Et lille stykke Sydfyn i det jyske
          </p>
        </div>
        <div className="relative z-20 bg-[#f4ebdf] p-6 text-[#22392c] max-w-sm w-full flex flex-col items-center justify-between h-100">
          <h2 className="text-xl">Lorem ipsum</h2>
          <p className="text-center text-[#758d7e] mt-[-30px]">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={da}
            >
              <div className="flex flex-col gap-4 w-full">
                <DatePicker
                  label="Ankommer"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  label="Afrejse"
                  value={endDate}
                  minDate={startDate || new Date()}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </div>
            </LocalizationProvider>
          </div>
          {notAvailable && (
            <div className="text-red-800 text-sm mb-[-20px]">
              Sorry, the selected dates are not available.
            </div>
          )}
          <button
            onClick={checkAvailability}
            className="px-4 py-2 bg-[#22392c] text-[#f4ebdf]  hover:bg-[#1a2e25] w-62"
          >
            Check Dates
          </button>
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <a href="#next-section" className="flex flex-col items-center group">
            <svg
              className="w-20 h-20 text-[#f4ebdf] group-hover:text-[#758d7e] transition"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>
      <section className="grid grid-cols-3 grid-rows-2 h-[600px]">
        <div className="h-full relative group">
          <img
            src={Service}
            alt="Service"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 w-full bg-[rgb(26,46,37,0.7)] text-[#f4ebdf] text-center text-2xl transition-colors duration-300 group-hover:bg-[rgb(117,141,126,0.7)] h-16 flex items-center justify-center">
            <p>SERVICES</p> 
          </div>
        </div>

        <div className="h-full relative group">
          <img
            src={Events}
            alt="Events"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 w-full bg-[rgb(26,46,37,0.7)] text-[#f4ebdf] text-center text-2xl transition-colors duration-300 group-hover:bg-[rgb(117,141,126,0.7)] h-16 flex items-center justify-center">
            <p>EVENTS</p> 
          </div>
        </div>

        <div className="row-span-2 bg-[#22392c] text-white flex items-center justify-center text-2xl font-semibold h-full">
          Your Text or Content Here
        </div>

        <div className="h-full relative group">
          <img src={Rest} alt="Rest" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 w-full bg-[rgb(26,46,37,0.7)] text-[#f4ebdf] text-center text-2xl transition-colors duration-300 group-hover:bg-[rgb(117,141,126,0.7)] h-16 flex items-center justify-center">
            <p>REST</p> 
          </div>
        </div>

        <div className="h-full relative group">
          <img
            src={Detail}
            alt="Detail"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 w-full bg-[rgb(26,46,37,0.7)] text-[#f4ebdf] text-center text-2xl transition-colors duration-300 group-hover:bg-[rgb(117,141,126,0.7)] h-16 flex items-center justify-center">
            <p>ABOUT</p> 
          </div>
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
