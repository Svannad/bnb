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
  loaderData: { user: { name: string; mail: string, phone:string; } };
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
    <div className="w-[450px] mx-auto p-6 bg-[#F4F2F0] flex flex-col justify-start items-center h-[110vh] gap-12">
          <h1 className="font-serif text-2xl font-medium text-left text-[#48302D]">
            Update Profile
          </h1>
          <Form id="profile-form" method="post" className="space-y-5">
            <div className="flex justify-between items-start flex-col w-full">
              <label
                htmlFor="name"
                className="block text-sm text-[#48302D]"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                 className="mt-1 block w-full px-3 py-2 border border-[#48302D] rounded-md mb-6 text-[#48302D]"
              />
            </div>

            <div className="flex justify-between items-start flex-col w-full">
              <label
                htmlFor="mail"
                className="block text-sm text-[#48302D]"
              >
                mail
              </label>
              <input
                id="mail"
                name="mail"
                type="email"
                defaultValue={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                 className="mt-1 block w-full px-3 py-2 border border-[#48302D] rounded-md mb-6 text-[#48302D]"
              />
            </div>

            <div className="flex justify-between items-start flex-col w-full">
              <label
                htmlFor="phone"
                className="block text-sm text-[#48302D]"
              >
                phone
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                defaultValue={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number..."
                 className="mt-1 block w-full px-3 py-2 border border-[#48302D] rounded-md mb-6 text-[#48302D]"
              />
            </div>

            <div className="flex justify-between items-start flex-col w-full">
              <label
                htmlFor="password"
                className="block text-sm text-[#48302D]"
              >
                New Password (Leave blank to keep current)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a new password..."
                className="mt-1 block w-full px-3 py-2 border border-[#48302D] rounded-md mb-6 text-[#48302D]"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="w-full py-2 px-4 border border-[#48302D] text-[#48302D] rounded-md cursor-pointer hover:opacity-80"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
               className="w-full py-2 px-4 bg-[#48302D] text-[#F4F2F0] rounded-md cursor-pointer hover:opacity-80"
              >
                Save
              </button>
            </div>
          </Form>
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
