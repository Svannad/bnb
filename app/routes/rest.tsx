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

    return redirect("/guestbook");
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
    <div className="flex flex-col items-center min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📖 Guest Book</h1>

      {/* Add form (visible only if logged in) */}
      {authUserId ? (
        <div className="w-full max-w-xl mb-6 p-6 bg-white rounded-xl shadow-sm">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-[#22392c] text-[#f4ebdf] rounded-md py-2 hover:opacity-90 transition"
            >
              ✍️ Sign the Guest Book
            </button>
          ) : (
            <Form method="post" className="space-y-4">
              <input type="hidden" name="actionType" value="create" />

              <label className="block text-sm font-medium text-gray-700">
                Rating
              </label>
              <select
                name="rating"
                defaultValue="5"
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="5">⭐⭐⭐⭐⭐</option>
                <option value="4">⭐⭐⭐⭐</option>
                <option value="3">⭐⭐⭐</option>
                <option value="2">⭐⭐</option>
                <option value="1">⭐</option>
              </select>

              <label className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                name="message"
                rows={4}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Share your experience..."
              />

              {actionData?.error && (
                <p className="text-red-500 text-sm">{actionData.error}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#22392c] text-[#f4ebdf] rounded-md py-2 hover:opacity-90 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Sign Guest Book"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 rounded-md py-2 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </div>
      ) : (
        <div className="w-full max-w-xl mb-6 p-6 bg-white rounded-xl shadow-sm text-gray-700">
          <p>
            You can read guestbook entries without an account. To add an entry
            you must
            <Link to="/signin" className="underline text-[#22392c]">
              sign in
            </Link>{" "}
            and have a booking.
          </p>
        </div>
      )}

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p className="text-lg">No guest entries yet 🖊️</p>
          <p className="text-sm">Be the first to leave a message!</p>
        </div>
      ) : (
        <div className="w-full max-w-xl space-y-6">
          {entries.map((entry) => {
            const isOwner =
              !!authUserId && entry.user && entry.user._id === authUserId;
            const isAdmin = authUserRole === "host";
            const canManage = isOwner || isAdmin;

            return (
              <div
                key={entry._id}
                className="border rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition"
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

                  <div className="text-yellow-500 ml-auto">
                    {"⭐".repeat(entry.rating)}{" "}
                    <span className="text-gray-300">
                      {"☆".repeat(5 - entry.rating)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mt-3 whitespace-pre-line">
                  {entry.message}
                </p>

                {/* edit/delete controls */}
                {canManage && (
                  <div className="mt-3 flex gap-3">
                    {/* Edit can route to a dedicated edit page; implement /guestbook/edit/:id separately */}
                    {isOwner && (
                      <Link
                        to={`/guests/edit/${entry._id}`}
                        className="text-sm text-[#22392c] hover:underline"
                      >
                        Edit
                      </Link>
                    )}

                    <Form method="post" className="inline">
                      <input type="hidden" name="actionType" value="delete" />
                      <input type="hidden" name="_id" value={entry._id} />
                      <button
                        type="submit"
                        className="text-sm text-red-600 hover:underline"
                        onClick={(e) => {
                          if (!confirm("Delete this entry?"))
                            e.preventDefault();
                        }}
                      >
                        Delete
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
  );
}
