import { useState } from "react";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "BNB" }];
}

export default function Home() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState("");

  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-500">Forsíða</h1>
      <p>Hero Section</p>
      <p>Velja Dato</p>
      <br />
      <br />
      <section>
        <label htmlFor="start">
          Start Date <br />
          <input
            type="date"
            name="start"
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <br />
        <br />
        <label htmlFor="end">
          End Date <br />
          <input
            type="date"
            name="end"
            min={startDate || today}
          />
        </label>
      </section>
    </>
  );
}
