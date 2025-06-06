import { redirect, useLoaderData, Form, useActionData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import Room from "~/models/Room";
import { sessionStorage } from "~/services/session.server";

// Loader: fetch room by id
export async function loader({ params, request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const authUserId = session.get("authUserId");
  if (!authUserId) throw redirect("/signin");

  const id = String(params.id);
  if (!id) {
    throw new Response("Room ID is required", { status: 400 });
  }

  // Just find by id - no user filter since room isn't linked to user
  const room = await Room.findOne({}).lean();

  if (room) {
    room._id = room._id.toString();
  }

  if (!room) throw new Response("Room not found", { status: 404 });

  return { room: JSON.parse(JSON.stringify(room)) };
}

export async function action({ params, request }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const authUserId = session.get("authUserId");
  if (!authUserId) throw redirect("/signin");

  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");

  if (typeof title !== "string" || title.trim() === "") {
    return { error: "Title is required" };
  }

  await Room.findByIdAndUpdate(String(params.id), {
    title: title.trim(),
    description: typeof description === "string" ? description.trim() : "",
  });

  return redirect("/dashboard");
}

export default function RoomEdit() {
  const { room } = useLoaderData() as { room: any };
  const actionData = useActionData() as { error?: string };

  return (
    <div className="max-w-md mx-auto p-6 border rounded mt-8">
      <h1 className="text-2xl font-bold mb-4">Edit Room</h1>

      {actionData?.error && (
        <p className="mb-4 text-red-600">{actionData.error}</p>
      )}

      <Form method="post" replace>
        <label className="block mb-2 font-semibold" htmlFor="title">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={room.title}
          className="w-full border p-2 rounded mb-4"
          required
        />

        <label className="block mb-2 font-semibold" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={room.description}
          className="w-full border p-2 rounded mb-4"
          rows={4}
        />

        <button
          type="submit"
          className="bg-[#48302D] text-white px-4 py-2 rounded hover:opacity-90"
        >
          Save Changes
        </button>
      </Form>
    </div>
  );
}
