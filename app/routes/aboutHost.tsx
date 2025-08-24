import Jonas1 from "~/assest/jonas1.jpeg";
import Jonas2 from "~/assest/jonas2.jpeg";
import Jonas3 from "~/assest/jonas3.jpeg";

export default function AboutHost() {
  return (
    <div className="flex min-h-screen relative">
      {/* Image scrapbook section */}
      <div className="w-1/3 relative hidden md:block">
        <img
          src={Jonas1}
          className="absolute top-10 left-10 w-55 h-67 object-cover shadow-lg rotate-[-6deg]"
        />
         <img
          src={Jonas3}
          className="absolute top-52 left-50 w-54 h-66 object-cover shadow-lg rotate-[4deg]"
        />
        <img
          src={Jonas2}
          className="absolute top-[380px] left-10 w-58 h-70 object-cover shadow-lg rotate-[-3deg]"
        />

      </div>

      {/* Text section */}
      <div className="w-full md:w-2/3 flex flex-col justify-center px-12 pt-20 pb-20 h-screen overflow-y-auto">
        <h1 className="font-serif text-4xl text-[#22392c]">Meet Your Host</h1>
        <br />
        <p className="text-[#22392c]">
          At the heart of this Bed & Breakfast stands Jonas, a 23-year-old
          medical student with a soft smile, a sharp mind, and a soul steeped in
          melody. Originally from the gentle coasts of Southern Fyn, Jonas
          traded the rhythms of the countryside for the pulse of the city in
          pursuit of a lifelong dream: to become a doctor. Yet even amidst
          textbooks and lectures, he remains deeply rooted in the warmth,
          generosity, and calm of his island upbringing.
        </p>
        <br />
        <p className="text-[#22392c]">
          When he isn't studying the human body, Jonas turns his attention to
          music. A passionate multi-instrumentalist, he finds joy in exploring a
          wide range of genres, from delicate acoustic arrangements to bold,
          rhythmic compositions. His evenings often end with the crackle of a
          well-loved vinyl record – An analog refuge from a digital world.
        </p>
        <br />
        <p className="text-[#22392c]">
          Jonas spent several years working in Human Resources, where he
          cultivated the interpersonal skills and intuitive understanding of
          people that now serve as the foundation for his approach to
          hospitality. These experiences, combined with his innate curiosity and
          South Fyn sensibility, have shaped a host who is both attentive and
          authentic.
        </p>
        <br />
        <p className="text-[#22392c]">
          Currently single, but ever the romantic, Jonas is open to love,
          perhaps even with a Jutland native, as he gracefully balances life as
          a student and proud owner of the coziest Bed & Breakfast in town.
          Whether you’re here for one night or several, you’ll find more than
          just a place to sleep — you’ll find presence, personality, and a host
          who treats guests not as customers, but as stories in progress.
        </p>
      </div>
    </div>
  );
}
