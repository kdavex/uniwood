import {
  HomeRounded,
  HomeOutlined,
  MessageRounded,
  MessageOutlined,
  NotificationsRounded,
  NotificationsOutlined,
  PersonRounded,
  PersonOutline,
  LogoutRounded,
  ArticleRounded,
  ArticleOutlined,
} from "@mui/icons-material";
import {
  MenuItem,
  ListItemIcon,
  Typography,
  Button,
  Avatar,
  Paper,
  useTheme,
} from "@mui/material";
import { useState, useContext, useEffect, SetStateAction } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserInfoContext } from "../providers/UserInfoProvider";
import { PosterModal } from "./Poster";
import Cookies from "js-cookie";

export default function Nav() {
  const [focusState, setFocusState] = useState({
    home: true,
    messages: false,
    notifications: false,
    profile: false,
    uniVault: false,
  });

  const [posterModalView, setPosterModalView] = useState(false);

  const location = useLocation();

  const handleUrlParamsChange = () => {
    if (location.pathname.startsWith("/message")) {
      handleFocus("messages");
    } else if (location.pathname.startsWith("/notification")) {
      handleFocus("notifications");
    } else if (location.pathname.startsWith("/profile")) {
      handleFocus("profile");
    } else if (location.pathname === "/") {
      handleFocus("home");
    } else if (location.pathname.startsWith("/univault")) {
      handleFocus("uniVault");
    } else {
      setFocusState({
        home: false,
        messages: false,
        notifications: false,
        profile: false,
        uniVault: false,
      });
    }
  };

  useEffect(handleUrlParamsChange, [location]);

  // utilities
  const handleFocus = (buttonName: string) => {
    let newFocusState: any = {};
    for (let key in focusState) {
      if (key === buttonName) {
        newFocusState[key] = true;
      } else {
        newFocusState[key] = false;
      }
    }
    setFocusState(newFocusState);
  };
  const openPosterModal = () => setPosterModalView(true);

  return (

    <nav className="sticky top-0  h-screen w-full flex-col justify-center custom2:flex hidden px-5">
      <img
        className="absolute -top-4 left-1/2 mx-auto aspect-square w-[225px] -translate-x-1/2 "  
        src={`${process.env.SERVER_PUBLIC}/assets/logo_label.svg`}
        alt="logo"
      />
      <Links focusState={focusState} />

      <AvatarNav />
      <PosterModal
        postModalView={posterModalView}
        setPostModalView={setPosterModalView}
      />
    </nav>
  );
}

// function ButtonNav({ openPosterModal }: { openPosterModal: VoidFunc }) {


function AvatarNav() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { userInfo } = useContext(UserInfoContext)!;

  const handleToggleOpen = () => {
    setOpen(!open);
  };
  return (
    <MenuItem
      className="sticky top-[90%] w-full rounded-full"
      selected={open}
      onClick={handleToggleOpen}
    >
      <Avatar
        className="avatar"
        src={`${process.env.SERVER_PUBLIC}/${userInfo.pfp}`}
        sx={{
          display: "inline-block",
          marginRight: "10px",
          border: "2px solid red ",
        }}
      />
      <div className="avatar-details">
        <p className="font-body text-base text-slate-800">
          {userInfo.fullname}
        </p>
        <Typography
          fontSize="14px"
          color={theme.palette.text.secondary}
          className="username"
          variant="body2"
        >
          @{userInfo.username}
        </Typography>
      </div>
      {open ? (
        <div
          className="absolute -top-[100%] left-0 flex w-full items-center rounded-lg bg-white  px-5 py-3 shadow-sm hover:bg-gray-50 hover:bg-none hover:shadow-md"
          onClick={() => {
            Cookies.remove("refresh_token");
            localStorage.clear();
            navigate("/login");
          }}
        >
          <p className="text-base text-slate-800">Logout</p>
          <LogoutRounded className="ml-auto text-slate-800" />
        </div>
      ) : null}
    </MenuItem>
  );
}

function Links({ focusState }: { focusState: FocustStateProps }) {
  const { userInfo } = useContext(UserInfoContext)!;
  const navigate = useNavigate();

  const goToHome = () => navigate("/");
  const goToMessages = () => navigate("/message");
  const goToNotifications = () => navigate("/notification");
  const goToProfile = () => navigate(`/profile/${userInfo.username}`);
  const goToUniVault = () => navigate("/univault");

  return (
    <div className="mt-12">
      <MenuItem
        className="flex w-fit items-center rounded-full px-9 py-5"
        onClick={goToHome}
        selected={focusState.home ? true : false}
      >
        <ListItemIcon className="text-slate-800">
          {focusState.home ? <HomeRounded /> : <HomeOutlined />}
        </ListItemIcon>
        <p
          className={`${focusState.home ? "font-bold" : "font-normal"} font-body text-lg text-slate-800`}
        >
          Home
        </p>
      </MenuItem>

      <MenuItem
        className="flex w-fit items-center rounded-full px-9 py-5"
        onClick={goToMessages}
        selected={focusState.messages ? true : false}
      >
        <ListItemIcon className="text-slate-800">
          {focusState.messages ? <MessageRounded /> : <MessageOutlined />}
        </ListItemIcon>
        <p
          className={`${focusState.messages ? "font-bold" : "font-normal"} font-body text-lg text-slate-800`}
        >
          Messages
        </p>
      </MenuItem>
      <MenuItem
        className="flex w-fit items-center rounded-full px-9 py-5"
        onClick={goToUniVault}
        selected={focusState.uniVault ? true : false}
      >
        <ListItemIcon className="text-slate-800">
          {focusState.uniVault ? <ArticleRounded /> : <ArticleOutlined />}
        </ListItemIcon>
        <p
          className={`${focusState.uniVault ? "font-bold" : "font-normal"} font-body text-lg text-slate-800`}
        >
          UniVault
        </p>
      </MenuItem>
      <MenuItem
        className="flex w-fit items-center rounded-full px-9 py-5"
        onClick={goToNotifications}
        selected={focusState.notifications ? true : false}
      >
        <ListItemIcon className="text-slate-800">
          {focusState.notifications ? (
            <NotificationsRounded />
          ) : (
            <NotificationsOutlined />
          )}
        </ListItemIcon>
        <p
          className={`${focusState.notifications ? "font-bold" : "font-normal"} font-body text-lg text-slate-800`}
        >
          Notifications
        </p>
      </MenuItem>
      <MenuItem
        className="flex w-fit items-center rounded-full px-9 py-5"
        onClick={goToProfile}
        selected={focusState.profile ? true : false}
      >
        <ListItemIcon className="text-slate-800">
          {focusState.profile ? <PersonRounded /> : <PersonOutline />}
        </ListItemIcon>
        <p
          className={`${focusState.profile ? "font-bold" : "font-normal"} font-body text-lg text-slate-800`}
        >
          Profile
        </p>
      </MenuItem>
    </div>
  );
}

interface FocustStateProps {
  home: boolean;
  messages: boolean;
  notifications: boolean;
  profile: boolean;
  uniVault: boolean;
}

type PosterModalViewAction = SetStateAction<boolean>;
type VoidFunc = () => void;
