import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { GiLaurelCrown } from "react-icons/gi";

export default function AdminNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-colors duration-600 flex justify-between items-center p-6 pr-8 mx-auto ${
        scrolled
          ? "bg-[#22392c]"
          : "bg-transparent text-[#22392c]"
      }`}
    >
      <figure>
        <NavLink to="/">
          <GiLaurelCrown
            className={`transition-transform duration-600 ease-in-out origin-left ${
              scrolled ? "scale-300" : "scale-800 mt-6"
            }`}
          />
        </NavLink>
      </figure>

      <nav className="flex gap-6 items-center text-[#f4ebdf]">
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
      </nav>
    </header>
  );
}
