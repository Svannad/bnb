import Hero from "~/assest/room.jpg";

export default function Term() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block w-1/3 ">
        <img src={Hero} className="h-[100vh] object-cover object-center" />
      </div>
      <div className="w-full md:w-2/3 bg-[#fffbee] flex flex-col justify-center px-20 pt-170 pb-20 h-[100vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-sm text-[#22392c] self-end mb-4 hover:text-[#758d7e] hover:cursor-pointer"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-serif text-[#22392c] mb-4">
          Terms and Conditions of Stay
        </h1>
        <p className="text-[#48302D] pb-6">
          By confirming your reservation at our Bed & Breakfast ("the
          Property"), you ("the Guest") acknowledge and agree to be bound by the
          following terms and conditions:
        </p>

        <ol className="text-[#48302D] list-decimal ml-6">
          <li className="pb-6">
            <strong className="text-[#22392c]">No Gatherings or Parties</strong>
            <br />
            Gatherings, parties, or events of any nature are strictly prohibited
            within the rooms or on the premises.
            <br />
            <em>
              (Unless, of course, the host is both invited and actively
              participating — ideally with snacks.)
            </em>
          </li>

          <li className="pb-6 ">
            <strong className="text-[#22392c]">Occupancy Restrictions</strong>
            <br />
            Only the number of guests specified at the time of booking are
            permitted to occupy the room. The Property reserves the right to
            evict any additional, unregistered guests.
            <br />
            <em>
              (Unless prior written or enthusiastic verbal approval has been
              granted by the host.)
            </em>
          </li>

          <li className="pb-6">
            <strong className="text-[#22392c]">Non-Transferability</strong>
            <br />
            Reservations are strictly non-transferable. Only the individual(s)
            named in the reservation may occupy the room.
          </li>

          <li className="pb-6">
            <strong className="text-[#22392c]">No-Show Policy</strong>
            <br />
            In the event of a no-show, the Guest authorizes the Property to
            charge one night's room rate (including applicable government taxes)
            to the credit card provided at the time of booking or as per the
            promotional conditions of the reservation.
          </li>

          <li className="pb-6">
            <strong className="text-[#22392c]">Conduct and Behaviour</strong>
            <br />
            The Property reserves the right to refuse service or terminate the
            stay of any Guest, without refund, for behavior that endangers the
            well-being, safety, or comfort of other guests or staff.
            <br />
            This includes, but is not limited to:
            <ul className="list-disc ml-6 mt-2">
              <li className="mb-2">
                Failure to comply with reasonable instructions by Property staff
              </li>
              <li className="mb-2">Discriminatory language or behavior</li>
              <li className="mb-2">Harassment or endangerment of others</li>
            </ul>
          </li>

          <li className="pb-6">
            <strong className="text-[#22392c]">
              Health, Safety, and Security
            </strong>
            <br />
            Guests must not compromise the health, safety, or security of the
            Property, its guests, or staff at any time.
            <br />
            <em>
              (For example, using the toaster to heat socks is discouraged. Yes,
              this happened once.)
            </em>
          </li>

          <li className="pb-6">
            <strong className="text-[#22392c]">
              Surprise Midnight Nourishment Clause
            </strong>
            <br />
            The Guest acknowledges and consents to the possibility of being
            gently awakened during the night by the host for the sole purpose of
            receiving freshly cooked chicken nuggets.
            <br />
            <em>(This is rare but not unheard of.)</em>
          </li>

          <li className="pb-6">
            <strong className="text-[#22392c]">
              Mayonnaise Tolerance Declaration
            </strong>
            <br />
            By accepting these Terms and Conditions, the Guest confirms they do
            not possess any known allergies or aversions to mayonnaise.
            <br />
            <em>
              (Failure to disclose such intolerance waives all rights to protest
              should said mayonnaise appear, also unannounced.)
            </em>
          </li>

          <li className="pb-6">
            <strong className="text-[#22392c]">Miscellaneous</strong>
            <br />
            These terms shall be governed by the laws of the jurisdiction in
            which the Property operates. The Property reserves the right to
            update or modify these Terms and Conditions at any time without
            prior notice, though ideally with charm.
          </li>
        </ol>
      </div>
    </div>
  );
}
