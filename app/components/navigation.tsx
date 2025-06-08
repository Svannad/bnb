import { useEffect, useState } from "react";
import { GiLaurelCrown } from "react-icons/gi";
import { NavLink } from "react-router";

export default function Navigation() {
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
          className={`sticky top-0 w-full z-50 transition-colors duration-300 flex justify-between items-center p-6 pr-8 mx-auto ${
            scrolled
              ? "bg-[#22392c] text-[#f4ebdf]"
              : "bg-transparent text-[#22392c]"
          }`}
        >
          <figure>
            <NavLink to="/">
              <GiLaurelCrown
                className={`transition-transform duration-300 ease-in-out origin-left ${
                  scrolled ? "scale-300" : "scale-500 mt-2"
                }`}
              />
            </NavLink>
          </figure>
    
          <nav className="flex gap-6 items-center">
        <NavLink to="/profile" className="text-[#22392c]">
          Profile
        </NavLink>
      </nav>
    </header>
  );
}
