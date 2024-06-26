import React from "react";
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
import NavAdmin from "../components/NavAdmin";
import { TokenContextProps, UserInfoContextProps } from "../types/providers";

export default function AdminRoot() {
  const navigate = useNavigate();
  const handleRedirection = () => {
    if (localStorage.getItem("accountStatus") === "BLOCKED") navigate("/login");

    if (localStorage.getItem("role") === "ADMIN") navigate("/console");
    else navigate("/");
  };
  useEffect(handleRedirection, []);
  return (
    <div className="root">
      <div>
        <Outlet />
      </div>
      <NavAdmin />
    </div>
  );
}
