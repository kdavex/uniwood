import { Button, TextField } from "@mui/material";
import { LockRounded } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import React, { useContext, useState } from "react";
import { AlertContext } from "../providers/AlertProvider";
import axiosClient from "../utils/axios";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const { setAlert } = useContext(AlertContext)!;
  const navigate = useNavigate();

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailError(" ");
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axiosClient
      .post("/credentials/resetPassword/sendTicket", {
        email,
      })
      .then(() => {
        setAlert({
          visible: true,
          message: "Email sent! Check your inbox.",
          severity: "success",
        });
        navigate("/login");
      })
      .catch((err) => {
        if (err.response.data.error === "UserNotRegistered") {
          setEmailError("Email not registered");
        }
      });
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="position absolute left-[50%] top-[50%] flex h-[400px] w-[500px] translate-x-[-50%] translate-y-[-50%] flex-col items-center justify-center rounded-xl bg-white px-5 shadow-lg"
    >
      <LockRounded className="rounded-full bg-red-200 p-2 text-[50px] text-red-400" />
      <p className="text my-3 text-lg font-bold text-slate-800">
        Forgot Password?
      </p>
      <p className="mb-7 text-center text-slate-600">
        Enter your Email address and we'll send you a link to reset your
        password.
      </p>
      <TextField
        className="textfield mb-3 w-full text-slate-800"
        type="email"
        name="usernameOrEmail"
        placeholder="Insert Email Here"
        color="secondary"
        onChange={handleTextFieldChange}
        required
        error={emailError ? true : false}
        helperText={emailError || " "}
        value={email}
      />

      <Button
        type="submit"
        className="w-full rounded-lg bg-red-400 py-2  text-center font-bold normal-case text-white hover:bg-red-500 "
      >
        Send Email
      </Button>

      <Link
        to={"/login"}
        className="sm:text-based mt-[15px] text-red-400 hover:text-red-700 md:text-sm"
      >
        Back to Login
      </Link>
    </form>
  );
}
