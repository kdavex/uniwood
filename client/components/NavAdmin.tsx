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
  ReportOutlined,
  ReportRounded,
  AccountCircleOutlined,
  AccountCircleRounded,
  CommentOutlined,
  CommentRounded,
  PostAddOutlined,
  PostAddRounded,
  DescriptionOutlined,
  DescriptionRounded,
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
import adminPic from "../assets/default-admin-pfp.png";

export default function NavAdmin() {
  const [focusState, setFocusState] = useState({
    home: true,
    AdminUser: false,
    AdminUnivault: false,
    AdminPost: false,
    AdminComments: false,
  });

  const [posterModalView, setPosterModalView] = useState(false);

  const location = useLocation();

  const handleUrlParamsChange = () => {
    if (location.pathname.startsWith("/console/AdminUser")) {
      handleFocus("AdminUser");
    } else if (location.pathname.startsWith("/console/AdminPost")) {
      handleFocus("AdminPost");
    } else if (location.pathname.startsWith("/console/AdminComment")) {
      handleFocus("AdminComment");
      // } else if (location.pathname === "/") {
      //   handleFocus("home");
    } else if (location.pathname.startsWith("/console/AdminUnivault")) {
      handleFocus("AdminUnivault");
    } else {
      setFocusState({
        home: false,
        AdminUser: false,
        AdminUnivault: false,
        AdminPost: false,
        AdminComments: false,
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
    <nav className=" sticky top-0 hidden  h-screen w-full flex-col border-r-2 px-5 custom2:flex ">
      <img
        className="absolute -top-3 left-1/2 mx-auto aspect-square w-[225px] -translate-x-1/2 "
        src={`${process.env.SERVER_PUBLIC}/assets/logo_label.svg`}
        alt="logo"
      />
      <div className="pt-20"></div>
      <p className="pt-32 text-center text-2xl font-bold">Admin Dashboard</p>
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
        src={`${process.env.SERVER_PUBLIC}/assets/default-admin-pfp.png`}
        sx={{
          display: "inline-block",
          marginRight: "10px",
          border: "2px solid red ",
        }}
      />
      <div className="avatar-details">
        <p className="font-body text-base text-slate-800">Admin</p>
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
  const [showReportDetails, setShowReportDetails] = useState(false);

  const goToAdminHome = () => navigate("/console");
  const goToAdminUser = () => navigate("/console/AdminUser");
  // const goToNotifications = () => navigate("/notification");
  // const goToProfile = () => navigate(`/profile/${userInfo.username}`);
  // const goToUniVault = () => navigate("/univault");
  const goToAdminUnivault = () => navigate("/console/AdminUnivault");
  const goToAdminPost = () => navigate("/console/AdminPost");
  const goToAdminComment = () => navigate("/console/AdminComment");

  const toggleReportDetails = () => {
    setShowReportDetails(!showReportDetails);
  };

  return (
    <div className="mt-4">
      <MenuItem
        className="flex w-fit items-center rounded-full px-9 py-5"
        onClick={goToAdminHome}
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
        onClick={goToAdminUser}
        selected={focusState.AdminUser ? true : false}
      >
        <ListItemIcon className="text-slate-800">
          {focusState.AdminUser ? (
            <AccountCircleRounded />
          ) : (
            <AccountCircleOutlined />
          )}
        </ListItemIcon>
        <p
          className={`${focusState.AdminUser ? "font-bold" : "font-normal"} font-body text-lg text-slate-800`}
        >
          User
        </p>
      </MenuItem>

      <MenuItem
        className="flex w-fit items-center rounded-full px-9 py-5"
        onClick={goToAdminUnivault}
        selected={focusState.AdminUnivault ? true : false}
      >
        <ListItemIcon className="text-slate-800">
          {focusState.AdminUnivault ? (
            <DescriptionRounded />
          ) : (
            <DescriptionOutlined />
          )}
        </ListItemIcon>
        <p
          className={`${focusState.AdminUnivault ? "font-bold" : "font-normal"} font-body text-lg text-slate-800`}
        >
          UniVault [A]
        </p>
      </MenuItem>

      <MenuItem
        className="flex w-fit items-center rounded-full px-9 py-5"
        onClick={toggleReportDetails}
        selected={showReportDetails}
      >
        <ListItemIcon className="text-slate-800">
          {showReportDetails ? <ReportOutlined /> : <ReportRounded />}
        </ListItemIcon>
        <p className="font-body text-lg font-normal text-slate-800">Report</p>
      </MenuItem>

      {showReportDetails && (
        <div style={{ marginLeft: "1rem" }}>
          <MenuItem
            className="flex w-fit items-center rounded-full px-9 py-4"
            onClick={goToAdminPost}
            selected={focusState.AdminPost ? true : false}
          >
            <ListItemIcon className="text-slate-800">
              {focusState.AdminPost ? <PostAddRounded /> : <PostAddOutlined />}
            </ListItemIcon>
            <p
              className={`${focusState.AdminPost ? "font-bold" : "font-normal"} font-body text-base text-slate-800`}
            >
              Post
            </p>
          </MenuItem>
          <MenuItem
            className="flex w-fit items-center rounded-full px-9 py-4"
            onClick={goToAdminComment}
            selected={focusState.AdminComments ? true : false}
          >
            <ListItemIcon className="text-slate-800">
              {focusState.AdminComments ? (
                <CommentRounded />
              ) : (
                <CommentOutlined />
              )}
            </ListItemIcon>
            <p
              className={`${focusState.AdminComments ? "font-bold" : "font-normal"} font-body text-base text-slate-800`}
            >
              Comments
            </p>
          </MenuItem>
        </div>
      )}
    </div>
  );
}

interface FocustStateProps {
  home: boolean;
  AdminUser: boolean;
  AdminUnivault: boolean;
  AdminPost: boolean;
  AdminComments: boolean;
}

type PosterModalViewAction = SetStateAction<boolean>;
type VoidFunc = () => void;
