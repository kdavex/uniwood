import React, { useState, useEffect } from "react";
import axiosClient from "../utils/axios";

export default function UniVault() {
  const [activeTab, setActiveTab] = useState<"Articles" | "Trainings">(
    "Articles",
  );
  const [articles, setArticles] = useState<Article[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);

  const initializeData = async () => {
    axiosClient.get("/articles").then((res) => {
      setArticles(res.data.data);
    });
    axiosClient.get("/trainings").then((res) => {
      setTrainings(res.data.data);
    });
  };

  useEffect(() => {
    initializeData();
  }, []);

  return (
    <div className="px-4 text-4xl sm:w-11/12 custom2:text-base custom:w-full">
      <h1 className="mb-8 mt-8 text-center text-6xl font-bold custom2:mb-4 custom2:text-3xl">
        UniVault
      </h1>
      <div className="flex flex-row justify-center gap-8 ">
        <button
          className={`mb-4 rounded-lg px-10 py-6 transition duration-300 focus:outline-none custom2:rounded-md custom2:py-2 md:mb-2  ${
            activeTab === "Articles"
              ? "bg-prima text-white hover:bg-orange-600"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
          onClick={() => setActiveTab("Articles")}
        >
          Articles
        </button>
        <button
          className={`mb-4 rounded-lg px-10 py-6 transition duration-300 focus:outline-none custom2:rounded-md custom2:py-2 md:mb-2  ${
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
        {activeTab === "Articles"
          ? articles.map((article) => (
              <a
                key={article.id}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div
                  className={`mb-10 cursor-pointer rounded-lg bg-white p-10 shadow-md transition duration-300 hover:shadow-lg custom2:mb-4 custom2:p-6`}
                >
                  <h2 className="mb-5 text-4xl font-bold custom2:mb-2 custom2:text-lg">
                    {article.title}
                  </h2>
                  <p
                    className="mb-4 overflow-hidden text-2xl text-gray-600 custom2:text-sm"
                    style={{ textOverflow: "ellipsis", maxHeight: "3em" }}
                  >
                    {article.description}
                  </p>

                  <p className="text-xl text-gray-500 custom2:text-xs">
                    Author: {article.author}
                  </p>
                </div>
              </a>
            ))
          : trainings.map((training) => (
              <a
                key={training.id}
                href={training.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div
                  className={`mb-10 cursor-pointer rounded-lg bg-white p-10 shadow-md transition duration-300 hover:shadow-lg custom2:mb-4 custom2:p-6`}
                >
                  <h2 className="mb-5 text-4xl font-bold custom2:mb-2 custom2:text-lg">
                    {training.title}
                  </h2>
                  <p
                    className="mb-4 overflow-hidden text-2xl text-gray-600 custom2:text-sm"
                    style={{ textOverflow: "ellipsis", maxHeight: "3em" }}
                  >
                    {training.description}
                  </p>

                </div>
              </a>
            ))}
      </div>
    </div>
  );
}

interface Article {
  id: string;
  title: string;
  description: string;
  author: string;
  link: string;
}

interface Training {
  id: string;
  title: string;
  description: string;
  link: string;
  author?: string;
}
