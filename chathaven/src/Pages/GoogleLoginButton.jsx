import React from "react";
import google_icon from "../icons/devicon_google.svg";
import { googleLogin } from "../services/authService";

const GoogleLoginButton = () => {
  return (
    <img
      src={google_icon}
      alt="Sign in with Google"
      className="block mx-auto hover:scale-105 cursor-pointer"
      onClick={googleLogin}
    />
  );
};

export default GoogleLoginButton;
