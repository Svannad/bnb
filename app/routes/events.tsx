import Aarhus from "~/assest/aarhus.jpg";

const annualEvents = [
  {
    title: "SPOT Festival",
    description:
      "Annual showcase of emerging Danish and Nordic musical talents across multiple venues.",
    link: "https://www.spotfestival.dk/",
  },
  {
    title: "Aarhus Jazz Festival",
    description:
      "Eight days of jazz, blues, and experimental music every July across the city.",
    link: "https://jazzfest.dk/",
  },
  {
    title: "Aarhus Festuge (Festival Week)",
    description:
      "Ten-day cultural festival every late August/early September with 1,000+ arts events.",
    link: "https://aarhusfestuge.dk/",
  },
  {
    title: "European Choir Games (special 2025)",
    description:
      "A spectacular international choral competition with choirs from across the world.",
    link: "https://interkultur.com/",
  },
];

const attractions = [
  {
    title: "ARoS Aarhus Art Museum",
    description:
      "Iconic rainbow panorama and one of Denmark’s leading art museums.",
    link: "https://en.wikipedia.org/wiki/ARoS_Aarhus_Kunstmuseum",
  },
  {
    title: "Moesgaard Museum",
    description:
      "Stunning archaeological and ethnographic museum a short trip from Aarhus.",
    link: "https://en.wikipedia.org/wiki/Moesgaard_Museum",
  },
  {
    title: "Den Gamle By (The Old Town)",
    description:
      "Open-air museum where you can walk through Danish history and culture.",
    link: "https://en.wikipedia.org/wiki/Den_Gamle_By",
  },
];

export default function Events() {
  return (
    <div className="flex min-h-screen">
      {/* Left image */}
      <div className="hidden md:block w-1/3 ">
        <img
          src={Aarhus}
          alt="Events in Aarhus"
          className="h-[100vh] object-cover object-center"
        />
      </div>

      {/* Right content */}
      <div className="w-full md:w-2/3 bg-[#fffbee] flex flex-col px-10 pt-20 pb-20 h-[100vh] overflow-y-auto">
        <h1 className="text-4xl font-serif text-[#22392c] mb-10">
          Events in Aarhus
        </h1>

        {/* Annual Events */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#22392c] mb-4">
            At Vilhelm Kiers
          </h2>
          <ul className="space-y-6">
            <li className="border-b border-[#d7d2c4] pb-4">
              <h3 className="text-xl text-[#444] font-medium">Baren.dk</h3>
              <p className="text-[#444]">
                The friendly dorm bar often hosting spontaneous gatherings.
              </p>
              <a
                href="https://www.facebook.com/BarendkVilhelmKiers/"
                target="_blank"
                className="text-[#22392c] underline text-sm"
              >
                Learn more
              </a>
            </li>
          </ul>
        </section>
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#22392c] mb-4">
            Annual Events
          </h2>
          <ul className="space-y-6">
            {annualEvents.map((event, idx) => (
              <li key={idx} className="border-b border-[#d7d2c4] pb-4">
                <h3 className="text-xl text-[#444] font-medium">
                  {event.title}
                </h3>
                <p className="text-[#444]">{event.description}</p>
                <a
                  href={event.link}
                  target="_blank"
                  className="text-[#22392c] underline text-sm"
                >
                  Learn more
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Attractions */}
        <section>
          <h2 className="text-2xl font-semibold text-[#22392c] mb-4">
            Must-Visit Attractions
          </h2>
          <ul className="space-y-6">
            {attractions.map((place, idx) => (
              <li key={idx} className="border-b border-[#d7d2c4] pb-4">
                <h3 className="text-xl text-[#444] font-medium">
                  {place.title}
                </h3>
                <p className="text-[#444]">{place.description}</p>
                <a
                  href={place.link}
                  target="_blank"
                  className="text-[#22392c] underline text-sm"
                >
                  Learn more
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
