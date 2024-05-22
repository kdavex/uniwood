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

const confrimpass = () => {
    return (
    
        <div className="position absolute left-[50%] top-[50%] flex h-[400px] w-[500px] translate-x-[-50%] translate-y-[-50%] flex-col items-center justify-center rounded-xl bg-white px-5 shadow-lg">
          <LockRounded className="rounded-full bg-red-200 p-2 text-[50px] text-red-400" />
          <p className="text my-3 text-lg font-bold text-slate-800">
            Reset Password
          </p>
          <p className="mb-7 text-center text-slate-600">
            Enter your new password below
          </p>
          <TextField
           className="textfield mb-[20px] w-3/4"
           type="password"
           name="newpass"
           placeholder="New Password"
           color="secondary"
           required>

          </TextField>
          <TextField
           className="textfield mb-[20px] w-3/4"
           type="password"
           name="conpass"
           placeholder="Confirm Password"
           color="secondary"
           required>

          </TextField>

          <Link to={"/login"} className="w-1/2 rounded-lg bg-red-400  py-2 font-bold text-white hover:bg-red-500 text-center ">
            Reset Password
          </Link>
        </div>
    );
}

export default confrimpass