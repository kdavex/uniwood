import chat from "../assets/images/chat.svg";
import post from "../assets/images/post.svg";
import view from "../assets/images/view-photo.svg";
import logo from "../assets/images/logo_label.svg";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="font-poppins bg-[#F1EFEE]">
      <Navbar />
      <Body />
      <Semifooter />
    </div>
  );
}

function Body() {
  return (
    <>
       <div className="md:m-10">
          <div className="flex lg:flex-row sm:flex-col justify-center items-center md:mx-20 sm:mx-10 sm:mt-10">
            <div className="flex-1 text-center font-semibold lg:text-5xl sm:text-3xl">
              <p>
                Connect within the
                <p> Woodworking Community</p>
              </p>
              <p className="text-center lg:text-base sm:text-sm font-normal lg:mt-10 sm:mt-5">
                A central space for Woodworkers, Woodcrafters, and Woodworking
                Enthusiasts to engage and share knowledge. Helps the users to
                interact in real-time messaging, creating a
                supportive environment where users can learn from each other,
                build connections, and work on projects together.
              </p>
            </div>
            <div className="flex-1">
              <img src={chat} alt="" className="size-auto my-10" />
            </div>
          </div>
          <div className="lg:my-36">
            <div className="flex lg:flex-row sm:flex-col justify-center items-center mt-10 lg:mx-24 sm:mx-10">
              <div className="flex-1">
                <img src={view} alt="" className="size-auto" />
              </div>
              <div className="flex-1 text-center font-semibold lg:text-5xl sm:text-3xl">
                <p>Share your expertise and works.</p>
                <p className="text-center lg:text-base sm:text-sm font-normal lg:mt-10 sm:mt-5">
                  Designed to encourage members of woodworking community to
                  showcase their knowledge, skills, and projects. Aims to foster
                  a culture of knowledge sharing within the woodworking
                  community, allowing users to gain feedback, inspire others,
                  and establish themselves as skilled craftsmen.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:my-30 sm:mt-20">
            <div className="flex lg:flex-row sm:flex-col justify-center items-center mt-10 lg:mx-24 sm:mx-10">
              <div className="flex-1 text-center font-semibold lg:text-5xl sm:text-3xl lg:mr-24">
                <p>Let's enhance your skills.</p>
                <p className="text-center lg:text-base sm:text-sm font-normal lg:mt-10 sm:mt-5">
                  Provides users with resources and opportunities to improve
                  their woodworking skills. By encouraging skill enhancement, it
                  contributes to a more knowledgeable and competent community,
                  fostering both personal growth and a culture of continuous
                  improvement among woodworking enthusiasts.
                </p>
              </div>
              <div className="flex flex-1">
                <img src={post} alt="" className="size-auto" />
              </div>
            </div>
          </div>
      </div>
    </>
  );
}

function Semifooter() {
  return (
    <>
      <div className="m-10">
        <div className="flex justify-center item-center mt-28">

          <img src={logo} alt="" className="lg:h-80 sm:h-44"/>
        </div>
        <div className="flex lg:flex-row sm:flex-col justify-center items-center lg:mx-36 lg:my-10">
          <div className="flex-1 mx-10 my-10 sm:w-full">
            <p className="text-center font-semibold text-3xl lg:mb-5">
              About UniWood
            </p>
            <p className="text-center lg:text-base sm:text-sm">
            UniWood is a platform designed to connect, support, and empower the woodworking community. It serves as a comprehensive online space where woodworkers, woodcrafters, and woodworking enthusiasts can engage, share their projects, and learn from one another.
            </p>
          </div>
          <div className="flex-1 mx-10 my-10 sm:w-full">

            <p className="text-center font-semibold text-3xl lg:mb-5">
              What We Do
            </p>
            <p className="text-center lg:text-base sm:text-sm">
            An online platform designed for the woodworking community, enabling users to connect, and share projects. Offers features like community posts, real-time messaging, and educational resources to foster learning and knowledge sharing, creating a vibrant space for growth and connection.
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center space-x-7 bg-secondary-400 p-10">
        <p className="font-semibold md:text-3xl text-center sm:text-lg">
          Register to learn and be more engage within the community.
        </p>
        <Link
          to={"/login"}
          className="md:text-xl sm:text-based border-2 border-prima px-5 py-2 rounded-full"
        >
          Register
        </Link>
      </div>
    </>
  );
}

 function Navbar() {
  return (
    <nav className="sticky top-0 z-50">
      <div className="container relative mx-auto py-3">
        <div className="flex justify-between item-center px-14 mx-14">
          <div className="flex-shrink-0">
            <img
              src={logo}
              alt="logo"
              className="md:size-28 sm:size-16"
            />
          </div>
          <div className="flex ml-12 item-center">
            <Link
              to={"/login"}
              className="md:px-7 md:py-2 sm:py-1 mt-3 mb-24 bg-gradient-to-r from-prima to-fourth text-tertiary rounded-md md:text-base md:h-10 md:mx-5 sm:text-xs sm:h-6 md:w-28 sm:w-16 sm:px-3"
            >
             Sign in
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
