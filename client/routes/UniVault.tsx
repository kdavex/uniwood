import React, { useState, useEffect } from "react";

export default function UniVault() {
  const [activeTab, setActiveTab] = useState("Articles");

  const articles = {
    links: [
      {
        id: 1,
        title: "The Artisans from Bataan Peninsula",
        description:
          "Discover the skilled artisans and their craftsmanship in Bataan Peninsula. Explore their traditional techniques and the cultural heritage they preserve.",
        author: "Maritess Garcia Reyes",
        link: "https://www.tatlerasia.com/homes/architecture-design/the-artisans-from-bataan-peninsula",
      },
      {
        id: 2,
        title:
          "Staying in Heritage: Revisiting the Las Casas Filipinas de Acuzar in Bagac, Bataan",
        description:
          "Experience the charm and history of Las Casas Filipinas de Acuzar in Bagac, Bataan. Immerse yourself in the rich cultural tapestry of this heritage site.",
        author: "Reuben Cañete",
        link: "https://bluprint-onemega.com/staying-in-heritage-revisiting-the-las-casas-filipinas-de-acuzar-in-bagac-bataan/",
      },
      {
        id: 3,
        title: "Exploring Real Estate Opportunities in Bataan",
        description:
          "Discover the potential of Bataans real estate market. Learn about investment opportunities and the growing economy of this vibrant province.",
        author: "Philippine Real Estate",
        link: "https://philippine-real-estate.com/blog/bataan/",
      },
      {
        id: 4,
        title: "Community Initiatives in Bataan: The Guilds BPSU",
        description:
          "Learn about the community initiatives led by The Guilds BPSU in Bataan. Discover their projects aimed at fostering education and sustainable development.",
        author: "Kesia Jamel Corton",
        link: "https://www.facebook.com/theguildsbpsu/posts/pfbid026FMWchAfeJFYNeMw8TzZDDy5bXMdUwBdXMZGL7UwRdanJPVwHpqF2Nf8JhQyhD8Xl",
      },
      {
        id: 5,
        title: "Empowering Women through Wood Mosaic Making in Bataan",
        description:
          "Explore the empowering journey of women in Bataan through wood mosaic making. Learn about their skills, creativity, and contribution to the community.",
        author: "Loi Balbaloza",
        link: "https://1bataan.com/wood-mosaic-making-an-epitome-of-women-empowerment/",
      },
      // Add more articles as needed
    ],
  };

  const trainings = {
    links: [
      {
        id: 1,
        title: "Woodworking Essentials: A Guide from Wood Academy PH",
        description:
          "Master the fundamentals of woodworking with this comprehensive guide from Wood Academy PH. Learn essential techniques and tips for woodworking enthusiasts.",
        link: "https://www.facebook.com/woodacademyPH",
      },
      {
        id: 2,
        title: "Carpentry Training Program in Pampanga by TESDA",
        description:
          "Join the carpentry training program offered by TESDA in Pampanga. Develop your carpentry skills and gain valuable knowledge for a successful career in woodworking.",
        link: "https://tesda.gov.ph/Tvi/Result?SearchCourse=Carpentry&SearchIns=&SearchLoc=pampanga",
      },
      // Add more trainings as needed
    ],
  };

  const content = activeTab === "Articles" ? articles.links : trainings.links;

  return (


    <div className="px-4 custom:w-full sm:w-11/12 text-4xl custom2:text-base">
      <h1 className="custom2:mb-4 mb-8 mt-8 text-center text-6xl custom2:text-3xl font-bold">UniVault</h1>
      <div className="flex flex-row justify-center gap-8 ">

        <button
          className={`mb-4 custom2:rounded-md rounded-lg px-10 custom2:py-2 py-6 transition duration-300 focus:outline-none md:mb-2  ${
            activeTab === "Articles"
              ? "bg-prima text-white hover:bg-orange-600"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
          onClick={() => setActiveTab("Articles")}
        >
          Articles
        </button>
        <button

          className={`mb-4 custom2:rounded-md rounded-lg px-10 custom2:py-2 py-6 transition duration-300 focus:outline-none md:mb-2  ${
            activeTab === "Trainings"
              ? "bg-prima text-white hover:bg-orange-600"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
          onClick={() => setActiveTab("Trainings")}
        >
          Trainings
        </button>
      </div>
      <div className="mt-8 ">
        {content.map((item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div
              className={`mb-10 custom2:mb-4 custom2:p-6 p-10 cursor-pointer rounded-lg bg-white shadow-md transition duration-300 hover:shadow-lg`}
            >
              <h2 className="custom2:mb-2 mb-5 text-4xl custom2:text-lg font-bold">{item.title}</h2>
              <p
                className="mb-4 overflow-hidden text-2xl custom2:text-sm text-gray-600"
                style={{ textOverflow: "ellipsis", maxHeight: "3em" }}
              >
                {item.description}
              </p>
              {item.author && (
                <p className="text-xl custom2:text-xs text-gray-500">Author: {item.author}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
