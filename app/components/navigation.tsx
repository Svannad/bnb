import { NavLink } from "react-router";

export default function Navigation() {
  return (
    <nav className="bg-white shadow-md p-4 flex gap-6 items-center">
      <NavLink to="/" className="text-gray-700 hover:text-red-500">Forsíða</NavLink>
      <NavLink to="/profile" className="text-gray-700 hover:text-red-500">Profile</NavLink>
    </nav>
  );
}
