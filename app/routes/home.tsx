import React, { useState } from "react";
import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import Booking from "~/models/Booking";
import { sessionStorage } from "~/services/session.server";
import Unavailable from "~/models/Unavailable";
import Hero from "~/assest/room.jpg";
import Service from "~/assest/service.jpg";
import Events from "~/assest/aros.webp";
import Rest from "~/assest/rest.jpg";
import Detail from "~/assest/jonas2.jpeg";
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
          <h1 className="text-6xl">Jonas' Bed & Breakfast</h1>
          <p className="text-3xl">Et lille stykke Sydfyn i det jyske</p>
        </div>
        <div className="relative z-20 bg-[#f4ebdf] p-6 text-[#22392c] max-w-sm w-full flex flex-col items-center justify-between h-100">
          <h2 className="text-xl">Book Your Room</h2>
          <p className="text-center text-[#758d7e] mt-[-30px]">
            Book your adventure now and make every stay a story worth telling.
          </p>
          <p className="text-center text-[#758d7e] mt-[-10px]">
           Press the calender icon for easier date picking
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={da}
            >
              <div className="flex flex-col gap-4 w-full">
                <DatePicker
                  label="Check In"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  label="Check Out"
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
          <Link
            to="/services"
            className="absolute bottom-0 w-full bg-[rgb(26,46,37,0.7)] text-[#f4ebdf] text-center text-2xl transition-colors duration-300 group-hover:bg-[rgb(117,141,126,0.7)] h-16 flex items-center justify-center"
          >
            <p>SERVICES</p>
          </Link>
        </div>

        <div className="h-full relative group">
          <img
            src={Events}
            alt="Events"
            className="w-full h-full object-cover  object-[center_75%]"
          />
          <Link to="/events">
          <div className="absolute bottom-0 w-full bg-[rgb(26,46,37,0.7)] text-[#f4ebdf] text-center text-2xl transition-colors duration-300 group-hover:bg-[rgb(117,141,126,0.7)] h-16 flex items-center justify-center">
            <p>EVENTS</p>
          </div>
          </Link>
        </div>

        <div className="row-span-2 bg-[#22392c] text-white flex items-center justify-center text-2xl font-semibold h-full">
          Your Text or Content Here
        </div>

        <div className="h-full relative group">
          <img src={Rest} alt="Rest" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 w-full bg-[rgb(26,46,37,0.7)] text-[#f4ebdf] text-center text-2xl transition-colors duration-300 group-hover:bg-[rgb(117,141,126,0.7)] h-16 flex items-center justify-center">
            <p>GUESTS</p>
          </div>
        </div>

        <div className="h-full relative group">
          <img
            src={Detail}
            alt="Detail"
            className="w-full h-full object-cover object-[center_40%]"
          />
          <Link to="/about">
            <div className="absolute bottom-0 w-full bg-[rgb(26,46,37,0.7)] text-[#f4ebdf] text-center text-2xl transition-colors duration-300 group-hover:bg-[rgb(117,141,126,0.7)] h-16 flex items-center justify-center">
              <p>ABOUT YOUR HOST</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="py-12 px-30 min-h-[80vh] flex flex-col justify-center items-start">
        <h1 className="font-serif text-4xl text-[#22392c]">
          The Story Behind Jonas’ Bed & Breakfast
        </h1>
        <br />
        <em className=" text-[#22392c]">A Love Letter to Home</em>
        <br />
        <p className=" text-[#22392c]">
          Far to the south, where the waves of the South Fyn Archipelago brush
          the shoreline like secret lovers in the night, a young man named Jonas
          grew up. With the scent of saltwater in his nose and birdsong etched
          into his childhood heart, he learned early on that beauty lives in
          simplicity: in the quiet moments around a well-set breakfast table, in
          the hush between the hills, in the ancient art of hospitality.
        </p>
        <br />
        <p className=" text-[#22392c]">
          Jonas carried a great dream—a fervent longing to heal, to understand,
          and to learn. With books beneath his arm and hope in his chest, he
          turned his gaze toward the horizon and left his soft, green homeland
          to seek knowledge in the heart of Jutland. There, in a city where the
          traffic lights never sleep and the bricks whisper a thousand stories,
          he began his journey into the mysteries of medicine.
        </p>
        <br />
        <p className=" text-[#22392c]">
          And yet, amidst lectures, long nights, and endless pages of anatomy,
          something began to stir within him—a quiet yearning for home. A
          whisper from the south—perhaps the wind across the fjord, perhaps the
          sound of a porcelain cup meeting its saucer in just the way he
          remembered. And so Jonas, who had long since tucked away his
          grandmother’s recipe book like a sacred talisman, began to create a
          place where memory might take root.
        </p>
        <br />
        <p className=" text-[#22392c]">
          Jonas’ Bed & Breakfast was not born merely as a resting place for
          weary travelers, but as a living, breathing heart in the chest of the
          city—a gentle haven where the scent of freshly baked carrot buns
          mingles with downy duvets and stories from another world. Every
          detail, from the carefully chosen furnishings to the hand-stirred jam,
          is a quiet homage to Southern Fyn: to the scent of wild roses, the
          warmth of the country kitchen, the human longing for belonging.
        </p>
        <br />
        <p className=" text-[#22392c]">
          Thus, a chapter was written—not in a medical journal, but in the warm
          book co-authored by homesickness and hospitality. A place where one
          does not merely sleep, but continues to dream. A place where the night
          may bring chicken nuggets and the morning a hint of mayonnaise, and
          where—at the heart of Jutland—you might just feel the wind of Southern
          Fyn upon your cheek.
        </p>
      </section>
    </>
  );
}
