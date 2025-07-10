import Breakfast from "~/assest/breakfast.jpg";

export default function Services() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block w-1/3 ">
        <img src={Breakfast} className="h-[100vh] object-cover object-center" />
      </div>
      <div className="w-full md:w-2/3 bg-[#fffbee] flex flex-col justify-center px-25 pt-40 pb-20 h-[100vh] overflow-y-auto">
        <h1 className="text-4xl font-serif text-[#22392c] mb-8">
          Guest Services at Jonas’ Bed & Breakfast
        </h1>
        <ul className="text-[#48302D] list-disc ml-6">
          <li className="pb-6">
            <strong className="text-[#22392c]">Breakfast</strong>
            <br />A light morning meal is often provided daily, most commonly
            featuring traditional Danish <em>rundstykker</em> (bread rolls)
            served with assorted toppings.
          </li>

          <li className="pb-6 ">
            <strong className="text-[#22392c]">Beverages</strong>
            <br />
            Complimentary coffee is available — black by default, with milk upon
            request (subject to availability and regional dairy logistics). The
            mighty Odense classic is a must try for everyone with Fyn in their
            heart and joy in their soul.
          </li>

          <li className="pb-6">
            <strong className="text-[#22392c]">Dinner</strong>
            <br />
            Dinner service is not formally included in the concept. However,
            guests are encouraged to speak with the host, as the premises are
            often well-stocked with a diverse selection of sausages.
          </li>

          <li className="pb-6">
            <strong className="text-[#22392c]">Wi-Fi Access</strong>
            <br />
            Free wireless internet is available throughout the property. Signal
            strength may vary depending on your location and the state of the
            router.
          </li>

          <li className="pb-6">
            <strong className="text-[#22392c]">Board Games & Books</strong>
            <br />A curated collection of board games and reading material is
            available for guest use, reading material is partly in latin.
            Selections may range from literary classics to university
            curriculum.
          </li>

          <li className="pb-6">
            <strong className="text-[#22392c]">
              Emergency Midnight Snacks
            </strong>
            <br />
            In rare circumstances, the host may appear unannounced with freshly
            prepared chicken nuggets. Guests are advised to remain receptive.
          </li>

          <li className="pb-6">
            <strong className="text-[#22392c]">Local Recommendations</strong>
            <br />
            Personal guidance is available from the host regarding nearby
            attractions, nature walks and cafés.
          </li>
        </ul>
      </div>
    </div>
  );
}
