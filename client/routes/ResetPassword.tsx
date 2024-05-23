import React, { useContext, useState } from "react";
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
  CancelRounded,
  CheckCircleRounded,
  LockRounded,
} from "@mui/icons-material";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../utils/axios";
import { AlertContext } from "../providers/AlertProvider";

export default function ResetPassoword() {
  const [newPassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tfErrors, setTfErrors] = useState({
    confirmPassword: "",
    newPassword: "",
  });
  const [passwordCriteria, setPasswordCriteria] = useState({
    hasUppercaseLetter: false,
    hasLowercaseLetter: false,
    hasNumber: false,
    hasSpecialCharacter: false,
  });
  const params = useParams<{ ticket: string }>();
  const { setAlert } = useContext(AlertContext)!;

  const newPasswordRef = React.useRef<HTMLInputElement>(null);
  const confirmPasswordRef = React.useRef<HTMLInputElement>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);

    // Check password criteria
    setPasswordCriteria({
      hasUppercaseLetter: /[A-Z]/.test(e.target.value),
      hasLowercaseLetter: /[a-z]/.test(e.target.value),
      hasNumber: /[0-9]/.test(e.target.value),
      hasSpecialCharacter: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
        e.target.value,
      ),
    });

    if (e.target.value.length < 8)
      tfErrors.newPassword = "Password must be at least 8 characters long";
    else tfErrors.newPassword = "";

    // match confirmPassword
    if (confirmPassword !== "" && e.target.value !== confirmPassword)
      tfErrors.confirmPassword = "Password does not match";
    else tfErrors.confirmPassword = "";

    setTfErrors({ ...tfErrors });
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(e.target.value);

    // match confirmPassword
    if (newPassword !== "" && e.target.value !== newPassword)
      tfErrors.confirmPassword = "Password does not match";
    else tfErrors.confirmPassword = "";
    setTfErrors({ ...tfErrors });
  };

  const resetPassword = () => {
    if (!newPasswordRef.current || !confirmPasswordRef.current) return;

    // Check password length
    if (newPassword.length < 8) {
      setTfErrors({
        ...tfErrors,
        newPassword: "Password must be at least 8 characters long",
      });
      return newPasswordRef.current.focus();
    }

    // Check passowrd criteria
    let passwordCriteriaPassCount = 0;
    Object.values(passwordCriteria).forEach((criteria) => {
      if (criteria) passwordCriteriaPassCount++;
    });
    if (passwordCriteriaPassCount < 3) {
      setTfErrors({
        ...tfErrors,
        newPassword:
          "Password must satisfy at least 3 following criteria above",
      });
      return newPasswordRef.current.focus();
    }

    // Check if password match
    if (newPassword !== confirmPassword) {
      setTfErrors({ ...tfErrors, confirmPassword: "Password does not match" });
      return confirmPasswordRef.current.focus();
    }

    // Reset password
    axiosClient
      .patch(`/credentials/resetPassword/verify/${params.ticket}`, {
        newPassword,
      })
      .then((res) => {
        if (res.status === 200) {
          alert("Password reset success");
          window.location.href = "/login";
        }
      })
      .catch((err) => {
        console.log(err.response.data);
        if (err.response.data.error === "TicketNotFount") {
          setAlert({
            visible: true,
            message: "Ticket not found",
            severity: "error",
          });
        }
      });
  };
  return (
    <div className="position absolute left-[50%] top-[50%] flex w-[500px] translate-x-[-50%] translate-y-[-50%] flex-col items-center justify-center rounded-xl bg-white px-14 py-7 shadow-lg">
      <p className="text my-3 text-lg font-bold text-slate-800">
        Reset Password
      </p>
      <div
        className="mb-7 rounded-md border
            border-solid border-slate-200 bg-slate-100 p-2 text-sm text-slate-600"
      >
        <p className="mb-2">
          Password must be at least 8 characters long and contains at least 3 of
          the following:
        </p>
        <div className="ml-3">
          <div className="flex items-center gap-1">
            {passwordCriteria.hasUppercaseLetter ? (
              <CheckCircleRounded className="size-[22px] text-green-400" />
            ) : (
              <CancelRounded className="size-[22px] text-red-400" />
            )}
            <span>Uppercase Letters</span>
          </div>
          <div className="flex items-center gap-1">
            {passwordCriteria.hasLowercaseLetter ? (
              <CheckCircleRounded className="size-[22px] text-green-400" />
            ) : (
              <CancelRounded className="size-[22px] text-red-400" />
            )}
            <span>Lowercase Letters</span>
          </div>
          <div className="flex items-center gap-1">
            {passwordCriteria.hasNumber ? (
              <CheckCircleRounded className="size-[22px] text-green-400" />
            ) : (
              <CancelRounded className="size-[22px] text-red-400" />
            )}
            <span>Numbers</span>
          </div>
          <div className="flex items-center gap-1">
            {passwordCriteria.hasSpecialCharacter ? (
              <CheckCircleRounded className="size-[22px] text-green-400" />
            ) : (
              <CancelRounded className="size-[22px] text-red-400" />
            )}
            <span>Non-alphanumeric Characters</span>
          </div>
        </div>
      </div>

      <TextField
        className="textfield mb-5 w-full"
        ref={newPasswordRef}
        onChange={handlePasswordChange}
        type="password"
        name="newPassword"
        label="New Passoword"
        placeholder="New Password"
        color="secondary"
        required
        error={tfErrors.newPassword ? true : false}
        helperText={tfErrors.newPassword || " "}
      />
      <TextField
        className="textfield mb-5 w-full"
        label="Confirm Password"
        ref={confirmPasswordRef}
        onChange={handleConfirmPasswordChange}
        type="password"
        value={confirmPassword}
        name="confirmPassword"
        placeholder="Confirm Password"
        color="secondary"
        required
        error={tfErrors.confirmPassword ? true : false}
        helperText={tfErrors.confirmPassword || " "}
      />

      <Button
        className="w-full rounded-lg bg-red-400  py-2 text-center font-bold text-white hover:bg-red-500 "
        onClick={resetPassword}
      >
        Reset Password
      </Button>
    </div>
  );
}
