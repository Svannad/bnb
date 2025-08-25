import bcrypt from "bcryptjs";
import { useState } from "react";
import { Form, redirect, useNavigate } from "react-router";
import User from "~/models/User";
import { getSession } from "~/services/session.server";

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("cookie"));
  const authUserId = session.get("authUserId");
  if (!authUserId) {
    throw redirect("/signin");
  }

  const user = await User.findById(authUserId);
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  return { user: user.toObject() };
}

export default function ProfileEdit({
  loaderData,
}: {
  loaderData: { user: { name: string; mail: string; phone: string } };
}) {
  const { user } = loaderData;
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.mail);
  const [phone, setPhone] = useState(user.phone);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleCancel() {
    navigate(-1);
  }

  return (
    <div className="min-h-screen bg-[#f4f2f0] flex items-center justify-center px-4">
      <section className="border border-[#d6c9b3] p-6 bg-[#fffbee] w-[90%] flex flex-col justify-center items-center">
        <h1 className="font-serif text-2xl font-medium text-left text-[#48302D]">
          Update Profile
        </h1>
        <Form id="profile-form" method="post" className="space-y-5 w-[60%]">
          <div className="flex justify-between items-start flex-col w-full">
            <label htmlFor="name" className="block text-sm font-medium text-[#22392c] mb-2">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-3 py-2 border border-[#ccc] rounded-md text-[#22392c]"
            />
          </div>

          <div className="flex justify-between items-start flex-col w-full">
            <label htmlFor="mail" className="block text-sm font-medium text-[#22392c] mb-2">
              Mail
            </label>
            <input
              id="mail"
              name="mail"
              type="email"
              defaultValue={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              className="w-full px-3 py-2 border border-[#ccc] rounded-md text-[#22392c]"
            />
          </div>

          <div className="flex justify-between items-start flex-col w-full">
            <label htmlFor="phone" className="block text-sm font-medium text-[#22392c] mb-2">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              defaultValue={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number..."
             className="w-full px-3 py-2 border border-[#ccc] rounded-md text-[#22392c]"
            />
          </div>

          <div className="flex justify-between items-start flex-col w-full">
            <label htmlFor="password" className="block text-sm font-medium text-[#22392c] mb-2">
              New Password (Leave blank to keep current)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a new password..."
              className="w-full px-3 py-2 border border-[#ccc] rounded-md text-[#22392c]"
            />
          </div>

          <div className="flex flex-col-reverse justify-center items-center  gap-3 space-x-3">
            <button
              type="button"
              className="px-4 py-2  bg-[#f4ebdf]  border border-[#d6c9b3] text-[#22392c] hover:bg-[#efe6da] w-full"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#22392c] text-[#f4ebdf]  hover:bg-[#1a2e25] w-full"
            >
              Save
            </button>
          </div>
        </Form>
      </section>
    </div>
  );
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const session = await getSession(request.headers.get("cookie"));
  const authUserId = session.get("authUserId");

  if (!authUserId) {
    throw redirect("/signin");
  }

  const user = await User.findById(authUserId);
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  let hashedPassword = user.password;
  const newPassword = formData.get("password")?.toString();
  if (newPassword) {
    hashedPassword = await bcrypt.hash(newPassword, 10);
  }

  await User.findByIdAndUpdate(authUserId, {
    name: formData.get("name"),
    mail: formData.get("mail"),
    phone: formData.get("phone"),
    password: hashedPassword,
  });

  return redirect("/profile");
}
