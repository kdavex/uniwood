import React, { useContext, useEffect } from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useState } from "react";
import { Tab } from "@mui/material";
import { useMediaQuery, useTheme } from '@mui/material';

import Post from "../components/Post.tsx";
import Poster, { PosterModal } from "../components/Poster";
import axiosClient from "../utils/axios";
import { useFetcher } from "react-router-dom";
import { UserInfoContext } from "../providers/UserInfoProvider.tsx";
import { TokenContext } from "../providers/TokenProvider.tsx";
export default function Main() {
  const { userInfo } = useContext(UserInfoContext)!;
  const [tabTarget, setTabTarget] = useState("forYou");
  const [postModalView, setPostModalView] = useState(false);
  const [initialPostData, setInitialPostData] = useState([]);
  const rootLoaderFetch = useFetcher();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabTarget(newValue);
  };

  const initializePostData = () => {
    if (!userInfo) return;
    axiosClient
      .get("/posts/recommended", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => setInitialPostData(res.data.data))
      .catch(console.error);
  };

  // handle initial post data
  useEffect(initializePostData, [userInfo, rootLoaderFetch]);

  return (
    <div className="home">
      <TabContext value={tabTarget}>
        <TabList className="z-10 sm:w-11/12 sm:justify-between"
          onChange={handleTabChange}
          variant="fullWidth">
          <Tab
            sx={{ width: "50%", fontWeight: "bold" }}
            label="For you"
            value="forYou"
            className="md:text-base sm:text-4xl"
          />

          <Tab
            sx={{ width: "50%", fontWeight: "bold" }}
            label="Following"
            value="following"
            className="md:text-base sm:text-4xl"

          />
        </TabList>
        <TabPanel sx={{ padding: "35px 45px" }} value="forYou">
          <Poster setPostModalView={setPostModalView} />
          {initialPostData &&
            initialPostData.map((post) => <Post postParam={post as any} />)}
          <PosterModal
            postModalView={postModalView}
            setPostModalView={setPostModalView}
          />
        </TabPanel>
        <TabPanel value="following">
          <FollowingpPostsTab />
        </TabPanel>
      </TabContext>
    </div>
  );
}

function FollowingpPostsTab() {
  const { userInfo } = useContext(UserInfoContext)!;
  const [initialPostData, setInitialPostData] = useState([]);
  const { accessToken } = useContext(TokenContext)!;

  const initializePostData = () => {
    if (!userInfo || !accessToken) return;
    axiosClient
      .get("/posts/recommended?fromFollowedUsersOnly=true", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => setInitialPostData(res.data.data ?? []))
      .catch(console.error);
  };

  useEffect(initializePostData, [userInfo, accessToken]);

  return (
    <TabPanel value="following">
      {initialPostData.length !== 0 ? (
        initialPostData.map((post) => <Post postParam={post} />)
      ) : (
        <p className="ml-2 mt-2 text-base italic text-slate-400">
          No posts from followed users
        </p>
      )}
    </TabPanel>
  );
}
