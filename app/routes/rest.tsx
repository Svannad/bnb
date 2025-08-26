// app/routes/guestbook.tsx
import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  redirect,
  useLoaderData,
  Form,
  useActionData,
  useNavigation,
  Link,
} from "react-router";
import React, { useState } from "react";
import Hero from "~/assest/guestbook.jpg";
import { FaFeatherAlt, FaTrash } from "react-icons/fa";
import { RiPencilFill } from "react-icons/ri";

type Entry = {
  _id: string;
  user: { _id: string; name?: string; role?: string } | null;
  message: string;
  rating: number;
  createdAt: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  // server-only imports inside loader to avoid bundling them to client
  const { default: GuestEntry } = await import("~/models/GuestEntry");
  const { default: User } = await import("~/models/User");
  const { sessionStorage } = await import("~/services/session.server");

  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const authUserIdRaw = session.get("authUserId");
  const authUserId = authUserIdRaw ? String(authUserIdRaw) : null;

  // Fetch entries and populate user name + role
  const entriesRaw = await GuestEntry.find()
    .populate("user", "name role")
    .sort({ createdAt: -1 })
    .lean();

  // Normalize ids and the populated user
  const entries: Entry[] = (entriesRaw || []).map((e: any) => ({
    ...e,
    _id: String(e._id),
    user: e.user
      ? { _id: String(e.user._id), name: e.user.name, role: e.user.role }
      : null,
    createdAt: e.createdAt
      ? new Date(e.createdAt).toISOString()
      : new Date().toISOString(),
  }));

  // get current user's role (if logged in)
  let authUserRole: string | null = null;
  if (authUserId) {
    const currentUser = await User.findById(authUserId).lean();
    authUserRole = currentUser?.role ?? null;
  }

  return { entries, authUserId, authUserRole };
}

export async function action({ request }: ActionFunctionArgs) {
  const { default: GuestEntry } = await import("~/models/GuestEntry");
  const { default: Booking } = await import("~/models/Booking");
  const { default: User } = await import("~/models/User");
  const { sessionStorage } = await import("~/services/session.server");

  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const authUserIdRaw = session.get("authUserId");
  const authUserId = authUserIdRaw ? String(authUserIdRaw) : null;

  if (!authUserId) {
    // If user not logged in, redirect to signin for protected actions
    return redirect("/signin");
  }

  const currentUser = await User.findById(authUserId).lean();
  const formData = await request.formData();
  const actionType = formData.get("actionType")?.toString();

  // CREATE
  if (actionType === "create") {
    const message = (formData.get("message") || "").toString().trim();
    const rating =
      parseInt((formData.get("rating") || "0").toString(), 10) || 0;

    // require a booking to leave message
    const hasBooking = await Booking.exists({ user: authUserId });
    if (!hasBooking) {
      return { error: "You must have a booking to leave a guestbook entry." };
    }

    if (!message) return { error: "Message cannot be empty." };
    if (rating < 1 || rating > 5)
      return { error: "Please provide a rating between 1 and 5." };

    await GuestEntry.create({
      user: authUserId,
      message,
      rating,
      createdAt: new Date(),
    });

    return redirect("/guests");
  }

  // EDIT
  if (actionType === "edit") {
    const id = (formData.get("_id") || "").toString();
    const message = (formData.get("message") || "").toString().trim();
    const rating =
      parseInt((formData.get("rating") || "0").toString(), 10) || 0;

    if (!id) return { error: "Missing entry id." };
    if (!message) return { error: "Message cannot be empty." };
    if (rating < 1 || rating > 5)
      return { error: "Please provide a rating between 1 and 5." };

    const entry = await GuestEntry.findById(id);
    if (!entry) return { error: "Entry not found." };

    // Owner or admin can edit
    const isOwner = String(entry.user) === authUserId;
    const isAdmin = currentUser?.role === "host";
    if (!isOwner && !isAdmin)
      return { error: "Unauthorized to edit this entry." };

    entry.message = message;
    entry.rating = rating;
    await entry.save();

    return redirect("/guests");
  }

  // DELETE
  if (actionType === "delete") {
    const id = (formData.get("_id") || "").toString();
    if (!id) return { error: "Missing entry id." };

    const entry = await GuestEntry.findById(id).populate("user", "role");
    if (!entry) return { error: "Entry not found." };

    const isOwner = String(entry.user) === authUserId;
    const isAdmin = currentUser?.role === "host";
    if (!isOwner && !isAdmin)
      return { error: "Unauthorized to delete this entry." };

    await entry.deleteOne();
    return redirect("/guests");
  }

  return { error: "Unknown action" };
}

export default function GuestBook() {
  // client-side UI
  const { entries, authUserId, authUserRole } = useLoaderData() as {
    entries: Entry[];
    authUserId: string | null;
    authUserRole: string | null;
  };
  const actionData = useActionData() as { error?: string } | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="flex min-h-screen">
        <div className="hidden md:block w-1/3 ">
          <img src={Hero} className="h-[100vh] object-cover object-center" />
        </div>
        <div className="w-full md:w-2/3 bg-[#fffbee] flex flex-col justify-start px-25 py-10 h-[100vh] overflow-y-auto">
        <h1 className="text-4xl font-serif text-[#22392c] mb-8">
          Guest Book
        </h1>
        <p className="text-left text-[#758d7e] mt-[-10px]">
            See what makes a stay at Jonas’ Bed & Breakfast unforgettable <br /> straight from our guests.
          </p>
          {/* Entries */}
          {entries.length === 0 ? (
            <div className="text-left text-gray-500 mt-10">
              <p className="text-lg">No guest entries yet</p>
              <p className="text-sm">Be the first to leave a message!</p>
            </div>
          ) : (
            <div className="w-full max-w-xl space-y-4 mt-5">
              {entries.map((entry) => {
                const isOwner =
                  !!authUserId && entry.user && entry.user._id === authUserId;
                const isAdmin = authUserRole === "host";
                const canManage = isOwner || isAdmin;

                return (
                  <div
                    key={entry._id}
                    className="border border-[#d6c9b3] p-6 bg-[#fffbee]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {entry.user?.name || "Anonymous"}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-yellow-600 ml-auto">
                        {"★".repeat(entry.rating)}
                        <span className="text-gray-500">
                          {"☆".repeat(5 - entry.rating)}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mt-3 whitespace-pre-line">
                      {entry.message}
                    </p>

                    {/* edit/delete controls */}
                    {canManage && (
                      <div className="mt-3 flex justify-end items-center gap-3">
                        {/* Edit can route to a dedicated edit page; implement /guestbook/edit/:id separately */}
                        {isOwner && (
                          <Link
                            to={`/guests/edit/${entry._id}`}
                            className=" text-[#22392c]"
                          >
                            <RiPencilFill  size={20} />
                          </Link>
                        )}

                        <Form method="post">
                          <input
                            type="hidden"
                            name="actionType"
                            value="delete"
                          />
                          <input type="hidden" name="_id" value={entry._id} />
                          <button
                            type="submit"
                            className=" text-red-800 pt-2 cursor-pointer"
                            onClick={(e) => {
                              if (!confirm("Delete this entry?"))
                                e.preventDefault();
                            }}
                          >
                            <FaTrash />
                          </button>
                        </Form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <section className="fixed bottom-0 w-full">
        {authUserId ? (
          <>
            {/* Floating Icon Button */}
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="fixed bottom-6 right-6 bg-[#22392c] text-[#f4ebdf] p-4 rounded-full shadow-lg hover:opacity-90 transition"
              >
                <FaFeatherAlt size={24} />
              </button>
            )}

            {/* Form Container */}
            {showForm && (
              <div className="border border-[#d6c9b3] p-6 bg-[#fffbee] flex justify-center">
                <Form method="post" className="space-y-4 w-[70%]">
                  <input type="hidden" name="actionType" value="create" />

                  <label className="block text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <select
                    name="rating"
                    defaultValue="5"
                    className="w-full px-3 py-2 border border-[#ccc] rounded-md text-[#22392c]"
                  >
                    <option value="5">★★★★★</option>
                    <option value="4">★★★★☆</option>
                    <option value="3">★★★☆☆</option>
                    <option value="2">★★☆☆☆</option>
                    <option value="1">★☆☆☆☆</option>
                  </select>

                  <label className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    className="w-full px-3 py-2 border border-[#ccc] rounded-md text-[#22392c]"
                    placeholder="Share your experience..."
                  />

                  {actionData?.error && (
                    <p className="text-red-800 text-sm">{actionData.error}</p>
                  )}

                  <div className="flex  gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 bg-[#22392c] text-[#f4ebdf] hover:bg-[#1a2e25]"
                    >
                      {isSubmitting ? "Submitting..." : "Sign Guest Book"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="w-full px-4 py-2 bg-[#f4ebdf] border border-[#d6c9b3] text-[#22392c] hover:bg-[#efe6da]"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </div>
            )}
          </>
        ) : (
          <div className="w-1/3 bg-white/80 backdrop-blur-sm  p-6 text-gray-700">
            <p>
              You can read guestbook entries without an account. <br /> To add an entry
              you must{" "}
              <Link to="/signin" className="underline text-[#22392c]">
                sign in
              </Link>{" "}
              and have a booking.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
