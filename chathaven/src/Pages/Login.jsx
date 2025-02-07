import React from "react";
import closedEye from "../icons/closed-eye.svg";
import fluentCheckboxChecked16Filled from "../icons/fluent_checkbox-checked-16-filled.svg";
import frame3 from "../icons/frame-3.svg";
import line1 from "../icons/line-1.svg";
import line2 from "../icons/line-2.svg";
import line3 from "../icons/line-3.svg";
import google_icon from "../icons/devicon_google.svg";
import "../styles/tailwind.CSS/Login.css";
import { signInWithEmail, signInWithGoogle } from "../services/authService";
import { getProfileByUsername } from "../services/profileService";

export const Login = () => {
    let login_password = "login_password";
    let login_username = "login_username";

    let handleLoginSubmit = async (event) => {
        event.preventDefault();
        const username = document.getElementById(login_username).value;
        const password = document.getElementById(login_password).value;
        console.log(`Username: ${username}, Password: ${password}`);
        
        const { data:profileData, error:profileError } = await getProfileByUsername(username);
        if (profileError || !profileData || profileData.length === 0) {
            console.error("Error fetching profile or profile not found.");
            alert("User does not exist or an error occurred.");
            return;
        }

        const profile = profileData[0];
        // Compare the entered password with the stored password.
        if (profile.password !== password) {
            alert("Invalid password.");
            return;
        }

        const email = profile.email;
        const { data, error } = await signInWithEmail(email, password);
        if (error) {
            console.error("Error signing in:", error.message);
            alert("Error signing in: " + error.message);
            return;
        }
        console.log("Login successful:", profile);
        // Redirect to dashboard upon successful login.
        window.location.href = "/app";
    };

    let handleLoginWithGoogle = async (event) => {
        event.preventDefault();
        const { data, error } = await signInWithGoogle();
        if (error) {
          console.error("Error signing in with Google:", error.message);
          window.alert("Failed to login with Google!");
        } else {
          console.log("User signed in with Google:", data);
          window.location.href = '/app';
        }
    };

    return (
    <div className="bg-[#0e0e0e] flex flex-row justify-center w-full">
            <div className="bg-[#0e0e0e] overflow-hidden w-[1440px] h-[1024px]">
                <div className="relative top-[81px] left-[60px] w-[1408px] h-[937px]">
                    <div className="absolute top-0 left-0 w-[1408px] h-[937px]">
                        <div className="absolute top-[299px] left-0 [font-family:'Noto_Sans-SemiBold',Helvetica] font-semibold text-white text-8xl tracking-[0] leading-[normal]">
                            ChatHaven
                        </div>

                        {/*<div className="inline-flex items-start gap-2.5 px-6 py-3.5 absolute top-[427px] left-[18px] border-4 border-solid border-white">*/}
                        {/*    /!*<div className="relative w-fit [font-family:'Noto_Sans-DisplaySemiBold_Italic',Helvetica] font-semibold italic text-white text-[32px] tracking-[0] leading-[normal]">*!/*/}
                        {/*    /!*    Skip the lag ?*!/*/}
                        {/*    /!*</div>*!/*/}
                        {/*</div>*/}

                        <div className="absolute w-[302px] h-[302px] top-0 left-[689px] rounded-[151px] [background:linear-gradient(180deg,rgb(83.15,0,96.69)_0%,rgb(13.17,10.16,47.81)_100%)]" />

                        <div className="absolute w-[220px] h-[220px] top-[678px] left-[1149px] rounded-[110px] rotate-[-28.50deg] [background:linear-gradient(180deg,rgb(48.34,0,96.69)_0%,rgb(10.16,16.18,47.81)_100%)]" />

                        <div className="absolute w-[482px] h-[798px] top-8 left-[839px] rounded-[20px] overflow-hidden border border-solid border-transparent shadow-[-8px_4px_5px_#0000003d] backdrop-blur-[53px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(53px)_brightness(100%)] [border-image:linear-gradient(to_bottom,rgb(255,255,255),rgba(0,0,0,0))_1] [background:linear-gradient(180deg,rgba(191.25,191.25,191.25,0.06)_0%,rgba(0,0,0,0)_100%)]">
                            <div className="inline-flex flex-col items-center gap-[101px] relative top-[97px] left-10">
                                <div className="inline-flex flex-col items-start gap-[47px] relative flex-[0_0_auto]">
                                    <div className="inline-flex flex-col items-start gap-3.5 relative flex-[0_0_auto]">
                                        <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                                            <div className="relative w-full h-full mt-[-1.00px] [font-family:'Noto_Sans-SemiBold',Helvetica] font-semibold text-white text-4xl tracking-[0] leading-[normal]">
                                                Login
                                            </div>

                                            <div className="relative w-fit [font-family:'Noto_Sans-Medium',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal]">
                                                Glad you’re back.!
                                            </div>
                                        </div>

                                        <div className="inline-flex flex-col items-start gap-[25px] relative flex-[0_0_auto]">
                                        <input
                                            type={"text"}
                                            placeholder={"Username"}
                                            id={login_username}
                                            required={true}
                                            className="w-[400px] px-4 py-3.5 relative rounded-xl border border-solid border-white [background:none] mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]"
                                            >

                                            </input>
                                            <div>
                                            <input
                                                type={"password"}
                                                placeholder={"Password"}
                                                id={login_password}
                                                required={true}
                                                className="w-[400px] px-4 py-3.5 relative rounded-xl border border-solid border-white [background:none] mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]"
                                            >
                                            </input>
                                            <img
                                                className="relative w-[18px] h-[18px] float-right align-middle"
                                                alt="Closed eye"
                                                src={closedEye}
                                                onClick={() => {
                                                    // toggle password visibility. this lambda function is called when the user clicks on the eye icon
                                                    const passwordField = document.getElementById("login_password");
                                                    passwordField.type = (passwordField.type === "password") ? "text" : "password";
                                                }}
                                            />
                                            </div>
                                            <div className="inline-flex flex-col items-start gap-3 relative flex-[0_0_auto]">
                                                <div className="inline-flex items-center gap-1 relative flex-[0_0_auto]">
                                                    <input
                                                        type="checkbox"
                                                        id="remember_me"
                                                        className="relative w-[18px] h-[18px]"
                                                    />
                                                    <label
                                                        htmlFor="remember_me"
                                                        className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans-Medium',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal]"
                                                    >
                                                        Remember me
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="inline-flex flex-col items-center justify-center gap-3 relative flex-[0_0_auto]">
                                                <div className="flex w-[400px] items-center justify-center gap-2.5 px-2.5 py-3.5 relative flex-[0_0_auto] rounded-xl [background:linear-gradient(180deg,rgb(97.75,141.78,255)_0%,rgb(134.57,64.08,205.06)_53.12%,rgb(87.5,3.9,116.88)_100%)]">
                                                    <button
                                                        type={"submit"}
                                                        onClick={handleLoginSubmit}
                                                        name = "login"

                                                        className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans-SemiBold',Helvetica] font-semibold text-white text-xl tracking-[0] leading-[normal] hover:scale-105">
                                                        Login
                                                    </button>
                                                </div>

                                                <a
                                                    href="/forgot"
                                                    className="relative w-fit [font-family:'Noto_Sans-Medium',Helvetica] font-medium  hover:scale-105 underline text-white text-base tracking-[0] leading-[normal]">
                                                    Forgot password ?
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="inline-flex flex-col items-center gap-3 relative flex-[0_0_auto]">
                                        <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
                                            <img
                                                className="relative w-[170px] h-0.5"
                                                alt="Line"
                                                src={line1}
                                            />

                                            <div className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans-Medium',Helvetica] font-medium text-[#4c4c4c] text-base tracking-[0] leading-[normal]">
                                                Or
                                            </div>

                                            <img
                                                className="relative w-[170px] h-0.5"
                                                alt="Line"
                                                src={line2}
                                            />
                                        </div>

                                        <img
                                            className="relative flex-[0_0_auto] hover:scale-105"
                                            alt="Frame"
                                            src={google_icon}
                                            onClick={handleLoginWithGoogle}
                                        />
                                    </div>
                                </div>

                                <div className="inline-flex flex-col items-center gap-2 relative flex-[0_0_auto]">
                                    <a
                                        href = "/signup"
                                        className="relative underline w-fit mt-[-1.00px] [font-family:'Noto_Sans-Medium',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal] hover:scale-105  ">
                                        Don’t have an account ? Signup
                                    </a>

                                    <div className="flex w-[400px] items-center justify-between px-1.5 py-1 relative flex-[0_0_auto] rounded-md [background:linear-gradient(180deg,rgba(97.75,97.75,97.75,0)_0%,rgba(97.75,97.75,97.75,0.07)_100%)]">
                                        <div className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]">
                                            {/*<div className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-white text-base tracking-[0] leading-[normal]">*/}
                                            {/*    Terms &amp; Conditions*/}
                                            {/*</div>*/}
                                        </div>

                                        <div className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]">
                                            {/*<div className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-white text-base tracking-[0] leading-[normal]">*/}
                                            {/*    Support*/}
                                            {/*</div>*/}
                                        </div>

                                        <div className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]">
                                            {/*<div className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-white text-base tracking-[0] leading-[normal]">*/}
                                            {/*    Customer Care*/}
                                            {/*</div>*/}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <img
                        className="absolute w-[561px] h-0.5 top-[467px] left-[270px]"
                        alt="Line"
                        src={line3}
                    />
                </div>
            </div>
        </div>
    );
};
