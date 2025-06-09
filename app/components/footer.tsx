export default function Footer() {
  return (
    <>
      <footer className="bg-[#22392c] text-[#f4ebdf] py-12 pt-20 min-h-100 flex flex-col justify-between w-full ">
        <div className="w-full mx-auto gap-8 flex justify-between items-start px-16">
          <div className="flex flex-col items-start">
            <h2 className="text-2xl font-serif font-semibold tracking-wide">
              Lorem, ipsum.
            </h2>
            <p className="mt-2 text-sm text-[#d6c9b3]">
              Lorem ipsum dolor sit amet consectetur.
            </p>
          </div>
          <div className="flex w-120 justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-3 tracking-wider">
                Explore
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/" className="text-[#d6c9b3] hover:underline">
                    About
                  </a>
                </li>
                <li>
                  <a href="/rooms" className="text-[#d6c9b3] hover:underline">
                    Services
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-[#d6c9b3] hover:underline">
                    Events
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-[#d6c9b3] hover:underline">
                    Rest
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3 tracking-wider">
                Contact
              </h3>
              <ul className="space-y-2 text-sm text-[#d6c9b3]">
                <li>
                  Email:{" "}
                  <a href="mailto:info@bnb.com" className="hover:underline">
                    info@mail.com
                  </a>
                </li>
                <li>Phone: +45 12 34 56 78</li>
                <li>Address: Envej 10, 8000 Aarhus, Denmark</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[#3a5649] mt-12 pt-6 text-center text-sm text-[#d6c9b3]">
          © {new Date().getFullYear()} Lorem ipsum dolor sit amet consectetur
          adipisicing elit. reserved.
        </div>
      </footer>
    </>
  );
}
