import React, { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import dateUtil from "date-and-time";

export default function Test2() {
  return (
    <Test2layout>
      <VerificationForm />
    </Test2layout>
  );
}

function Test2layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen  w-screen flex-col items-center justify-center bg-slate-200">
      {children}
    </div>
  );
}

function VerificationForm() {
  // Variables
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRef = useRef<HTMLInputElement[]>([]);
  const [timeToResend, setTimeToResend] = useState(20);
  const [codeResendable, setCodeResendable] = useState(false);
  const codeResendInterval = useRef<NodeJS.Timeout | null>(null);

  // handlers
  const handleCodeResendInterval = () => {
    setCodeResendable(false);
    setTimeToResend(20);
    codeResendInterval.current = setInterval(() => {
      setTimeToResend((prev) => prev - 1);
    }, 1000);

    return () => {
      if (codeResendInterval.current) {
        clearInterval(codeResendInterval.current);
      }
    };
  };
  const watchCodeTimeTotResend = () => {
    if (timeToResend === 0 && codeResendInterval.current) {
      clearInterval(codeResendInterval.current);
      setCodeResendable(true);
    }
  };
  const handleValueChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.currentTarget.value = "";
      code[Number(e.currentTarget.name)] = "";
      setCode(code);

      if (Number(e.currentTarget.name) - 1 >= 0) {
        inputRef.current[Number(e.currentTarget.name) - 1].focus();
      }
    } else if (e.key.match(/^[a-zA-Z0-9]$/)) {
      e.currentTarget.value = e.key;
      code[Number(e.currentTarget.name)] = e.key;
      setCode(code);

      if (Number(e.currentTarget.name) <= 4)
        inputRef.current[Number(e.currentTarget.name) + 1].focus();
      else inputRef.current[Number(e.currentTarget.name)].blur();
    }
  };

  // Component

  useEffect(handleCodeResendInterval, []);
  useEffect(watchCodeTimeTotResend, [timeToResend]);

  return (
    <div className="bg-blue-200 px-10 py-20">
      <p className="mb-3 text-center font-header text-lg font-bold text-slate-800">
        Account Verification
      </p>
      <p className="= mb-5 text-center font-body text-base text-slate-800">
        Enter code sent to <span className="italic ">johndoe@gmail.com </span>
        <span className="text-[.75rem] hover:cursor-pointer hover:text-blue-500 hover:underline">
          Change
        </span>
      </p>
      <div className="mb-4 flex justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            type="text"
            ref={(el) => el && (inputRef.current[i] = el)}
            className=" mb-4 h-[64px]  w-[48px] rounded-lg border border-solid border-slate-300 text-center font-body text-2xl font-bold text-slate-800"
            maxLength={1}
            name={`${i}`}
            onKeyUp={handleValueChange}
          />
        ))}
      </div>
      {codeResendable && (
        <p className="mb-5 text-center font-body text-sm text-slate-800">
          Didn't receive the code?{" "}
          <span
            className="text-blue-600 underline hover:cursor-pointer hover:underline"
            onClick={handleCodeResendInterval}
          >
            Resend Code
          </span>
        </p>
      )}
      {!codeResendable && <TimerComponent seconds={timeToResend} />}

      <Button
        className="ml-auto block font-body text-base font-bold normal-case text-white"
        variant="contained"
      >
        Sign Up
      </Button>
    </div>
  );
}

function TimerComponent({ seconds }: { seconds: number }) {
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = seconds % 60;
  return (
    <p className="mb-5 text-center font-body text-sm text-slate-800">
      Resend code in {minutes !== 0 ? `${minutes}:` : ""}
      {secondsLeft !== 0 ? secondsLeft : "00"}
    </p>
  );
}
