import {
  Avatar,
  Box,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { SearchRounded } from "@mui/icons-material";
import { useContext, useEffect, useState } from "react";
import { Theme, useTheme } from "@mui/material/styles";
import { Outlet, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { TokenContext } from "../providers/TokenProvider";
import { sendRefreshTokenRequest, sendUserInfoRequest } from "../utils";
import { UserInfoContext } from "../providers/UserInfoProvider";
import axiosClient from "../utils/axios";
import Nav from "../components/Nav";
import Navmob from "../components/Navmob";
import { TokenContextProps, UserInfoContextProps } from "../types/providers";

export async function loader() {
  const refreshTokenResponse = await sendRefreshTokenRequest();
  const userInfoResponse = await sendUserInfoRequest(
    localStorage.getItem("id") as string,
  );

  if (
    refreshTokenResponse?.status === "success" &&
    userInfoResponse?.status === "success" &&
    userInfoResponse?.data.id === localStorage.getItem("id")
  ) {
    localStorage.setItem("accessToken", refreshTokenResponse.accessToken);
  } else {
    console.error({ userInfoResponse, refreshTokenResponse });
    return redirect("/welcome");
  }
  return { userInfoResponse: userInfoResponse.data, refreshTokenResponse };
}

export default function Root() {
  const theme = useTheme();
  const { setUserInfo } = useContext(UserInfoContext) as UserInfoContextProps;
  const { userInfoResponse, refreshTokenResponse } = useLoaderData() as {
    userInfoResponse: UserInfoResponseData;
    refreshTokenResponse: RefreshTokenResponseData;
  };
  const { setAccessToken } = useContext(TokenContext) as TokenContextProps;
  const navigate = useNavigate();
  // const match = useRouteMatch()

  // Utilities
  const handleUserAuthentication = () => {
    setUserInfo({
      fullname: userInfoResponse.fullname,
      pfp: userInfoResponse.pfp,
      username: userInfoResponse.username,
      address: userInfoResponse.address,
      bio: userInfoResponse.bio,
      id: userInfoResponse.id,
      cover: userInfoResponse.cover,
      affiliation: userInfoResponse.affiliation,
    });
    setAccessToken(refreshTokenResponse.accessToken);
    localStorage.setItem("accessToken", refreshTokenResponse.accessToken);
  };

  const handleRedirection = () => {
    if (localStorage.getItem("accountStatus") === "BLOCKED") navigate("/login");

    if (localStorage.getItem("role") === "ADMIN") navigate("/console");
    else navigate("/");
  };
  useEffect(handleRedirection, []);

  useEffect(handleUserAuthentication, [userInfoResponse, refreshTokenResponse]);
  return (
    <div className="root">
      <Navmob />
      <main>
        <Navmob />
        <Outlet />
      </main>
      <Nav />
      <RightSection theme={theme} />
    </div>
  );
}

function RightSection({ theme: theme }: { theme: Theme }) {
  const [, setSearch] = useState("");
  const navigate = useNavigate();
  return (
    <section className="hidden custom2:block">
      <TextField
        className="search-bar"
        placeholder="Search"
        fullWidth
        InputProps={{
          startAdornment: <SearchRounded sx={{ marginRight: "15px" }} />,
          sx: { borderRadius: "25px", height: "45px", paddingLeft: "20px" },
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              navigate(`/search?q=${e.currentTarget.value}`);
            }
          },
        }}
        onChange={(e) => setSearch(e.target.value)}
        variant="outlined"
        name="search"
      />
      <SuggestedAccount theme={theme} />
      <Trends theme={theme} />
    </section>
  );
}
function Trends({ theme: theme }: { theme: Theme }) {
  const [tags, setTags] = useState<Record<string, number> | null>(null);
  const loaderData = useLoaderData();
  const navigate = useNavigate();

  const handleDataInitialization = () => {
    axiosClient
      .get("/posts/topTags?count=5", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => setTags(res.data.data));
  };
  const handleNavigate = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    return navigate(`/search?q=${e.currentTarget.id}`);
  };
  useEffect(handleDataInitialization, [loaderData]);

  return (
    <div className="trends-container">
      <Typography
        variant="h5"
        fontFamily={"Montserrat"}
        fontWeight={"900"}
        color={theme.palette.text.primary}
        paddingTop={"18px"}
        paddingLeft={"18px"}
        marginBottom={"10px"}
      >
        Top Trends
      </Typography>

      {tags &&
        Object.entries(tags).map(([tag, count]) => (
          <MenuItem
            id={tag}
            className="trends"
            onClick={handleNavigate}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Typography className="header" variant="body1">
              #{tag}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              {count} posts
            </Typography>
          </MenuItem>
        ))}
    </div>
  );
}
function SuggestedAccount({ theme: theme }: { theme: Theme }) {
  const loaderData = useLoaderData();
  const [newUsers, setNewUses] = useState<Author[] | null>(null);
  const navigate = useNavigate();

  const handleDataInitialization = () => {
    axiosClient
      .get("/users/newUsers?count=3", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        setNewUses(res.data.data);
      });
  };
  const handleNavigate = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) =>
    navigate(`/profile/${e.currentTarget.id}`);

  useEffect(handleDataInitialization, [loaderData]);
  return (
    <div className="suggested-account-container">
      <Typography
        variant="h5"
        fontFamily={"Montserrat"}
        fontWeight={"900"}
        color={theme.palette.text.primary}
        paddingTop={"18px"}
        paddingLeft={"18px"}
        marginBottom={"10px"}
      >
        New Users
      </Typography>

      {newUsers &&
        newUsers.map((user) => (
          <MenuItem
            className="suggested-account"
            id={user.id}
            onClick={handleNavigate}
          >
            <Avatar
              className="avatar"
              src={`${process.env.SERVER_PUBLIC}/${user.pfp}`}
              sx={{ display: "inline-block", marginRight: "10px" }}
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography className="body1" variant="body1" fontSize={"15px"}>
                {user.fullname}
              </Typography>
              <Typography
                className="subtitle1"
                sx={{ color: theme.palette.text.secondary }}
              >
                @{user.username}
              </Typography>
            </Box>
          </MenuItem>
        ))}
    </div>
  );
}
