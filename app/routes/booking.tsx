import { redirect, type LoaderFunctionArgs } from "react-router";
import type { Route } from "./+types/home";
import { sessionStorage } from "~/services/session.server"; // adjust path to your file

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BNB" }
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const authUserId = session.get("authUserId");

  if (!authUserId) {
    throw redirect("/signin");
  }

  // If user is authenticated, return some data or just `null`
  return null;
}

export default function Booking() {
  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-500">Booking</h1>
      <p>Kamar Info</p>
      <p>Accept Ting</p>
    </>
  );
}