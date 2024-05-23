import axiosClient from "../utils/axios";

export function sendRegistrationOTP({ email }: { email: string }) {
  return axiosClient.post("/otp/register/send", {
    email,
  });
}

export async function verifyRegistrationOTP({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) {
  return axiosClient
    .post("/otp/register/verify", {
      email,
      otp,
    })
    .then((res) => {
      if (res.status === 200) {
        return true;
      }
    })
    .catch((err) => {
      console.error(err);
      return false;
    });
}
