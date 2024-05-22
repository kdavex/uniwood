import React from 'react'
import {
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    IconButton,
    Modal,
    TextField,
  } from "@mui/material";
  import {
    LockRounded,
  } from "@mui/icons-material";
  import {
    Link,
  } from "react-router-dom";

const forgot = () => {
    return (
    
          <div className="position absolute left-[50%] top-[50%] flex h-[400px] w-[500px] translate-x-[-50%] translate-y-[-50%] flex-col items-center justify-center rounded-xl bg-white px-5 shadow-lg">
            <LockRounded className="rounded-full bg-red-200 p-2 text-[50px] text-red-400" />
            <p className="text my-3 text-lg font-bold text-slate-800">
              Forgot Password?
            </p>
            <p className="mb-7 text-center text-slate-600">
              Enter your Email address and we'll send you a link to reset your password.
            </p>
            <TextField
             className="textfield mb-[20px] w-full"
             type="email"
             name="usernameOrEmail"
             placeholder="Insert Email Here"
             color="secondary"
             required>

            </TextField>

            <Link to={"/confirmpass"} className="w-1/2 rounded-lg bg-red-400  py-2 font-bold text-white hover:bg-red-500 text-center ">
              Send Email
            </Link>
            
            <Link
          to={"/login"}
          className="md:text-sm sm:text-based mt-[15px] text-red-400 hover:text-red-700"
        >
          Back to Login
        </Link>
          </div>
      );
}

export default forgot
