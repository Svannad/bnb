import { useEffect, useState } from "react";
import { GiLaurelCrown } from "react-icons/gi";
import { NavLink, useLocation } from "react-router";

export default function DefaultNav() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Only attach scroll listener on home page
    if (location.pathname === "/") {
      function handleScroll() {
        setScrolled(window.scrollY > 10);
      }

      window.addEventListener("scroll", handleScroll);

      // Check scroll on mount in case page loads scrolled
      handleScroll();

      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      // For other pages, always show scrolled style
      setScrolled(true);
    }
  }, [location.pathname]);

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-colors duration-600 flex justify-between items-center p-6 pr-8 mx-auto ${
        scrolled
          ? "bg-[#22392c] text-[#f4ebdf]"
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

      <nav className="flex gap-6 items-center text-[#f4ebdf] text-lg">
        <NavLink to="/signin">Sign In</NavLink>
      </nav>
    </header>
  );
}
