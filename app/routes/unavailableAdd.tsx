import { Form, useLoaderData, redirect, Link } from "react-router";
import { useState, useEffect } from "react";
import Unavailability from "~/models/Unavailable";

// loader
export async function loader() {
  const unavailableDates = await Unavailability.find().lean();
  return { unavailableDates: JSON.parse(JSON.stringify(unavailableDates)) };
}

// action
export async function action({ request }) {
  const formData = await request.formData();
  const start = formData.get("start");
  const end = formData.get("end");
  const reason = formData.get("reason");

  if (formData.get("_method") === "delete") {
    const id = formData.get("id");
    await Unavailability.deleteOne({ _id: id });
    return redirect("/dashboard/unavailable");
  }

  if (!start || !end) {
    return { error: "Start and End date are required." };
  }

  await Unavailability.create({
    startDate: new Date(start),
    endDate: new Date(end),
    reason,
  });

  return redirect("/dashboard/unavailable");
}

export default function UnavailableAdd() {
  const { unavailableDates } = useLoaderData() as { unavailableDates: any[] };

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endMin, setEndMin] = useState(today);

  useEffect(() => {
    setEndMin(startDate);
  }, [startDate]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Manage Unavailable Dates</h1>

      <Form method="post" className="mb-6 space-y-4">
        <div>
          <label htmlFor="start">Start Date</label>
          <input
            type="date"
            name="start"
            id="start"
            required
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="end">End Date</label>
          <input
            type="date"
            name="end"
            id="end"
            required
            min={endMin}
          />
        </div>
        <div>
          <label htmlFor="reason">Reason (optional)</label>
          <input type="text" name="reason" id="reason" />
        </div>
        <button type="submit" className="btn-primary">
          Add Unavailability
        </button>
      </Form>

      <h2 className="text-xl font-semibold mb-2">
        Currently Unavailable Dates
      </h2>
      <ul>
        {unavailableDates.map(({ _id, startDate, endDate, reason }) => (
          <li key={_id} className="mb-2 flex items-center justify-between">
            <span>
              {new Date(startDate).toLocaleDateString()} -{" "}
              {new Date(endDate).toLocaleDateString()}{" "}
              {reason && `(${reason})`}
            </span>
            <Form
              method="post"
              onSubmit={(e) => {
                if (!confirm("Delete this unavailable date?"))
                  e.preventDefault();
              }}
            >
              <input type="hidden" name="_method" value="delete" />
              <input type="hidden" name="id" value={_id} />
              <button type="submit" className="btn-danger">
                Delete
              </button>
            </Form>
          </li>
        ))}
      </ul>
      <Link to="/dashboard">Go Back</Link>
    </>
  );
}
