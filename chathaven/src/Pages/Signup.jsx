import React, { useState } from "react";
import frame3 from "../icons/frame-3.svg";
import line1 from "../icons/line-1.svg";
import line2 from "../icons/line-2.svg";
import line3 from "../icons/line-3.svg";
// import slice1 from "../icons/slice-1.svg";
import google_icon from "../icons/devicon_google.svg";
import { signInWithGoogle } from "../services/authService";
import { signUpUser } from "../services/userService";
import "../styles/tailwind.CSS/Signup.css";

export const Signup = () => {

    const [userType, setUserType] = useState("Member");

    const handleSignUpSubmit = async (event) => {
        event.preventDefault();
        const username = document.getElementById("signup_username").value;
        const email = document.getElementById("signup_email").value;
        const password = document.getElementById("signup_password").value;
        const confirmPassword = document.getElementById("signup_confirm_password").value;

        if (password !== confirmPassword) {
          alert("Passwords do not match!");
          return;
        }
    
        const { data, error } = await signUpUser(email, password, {
            username,
            role: userType,
        });
        if (error) {
          console.error("Error signing up:", error.message);
          alert(`Error signing up: ${error.message}`);
        } else {
          console.log("Signup successful:", data);
          // Redirect to dashboard
          window.location.href = '/login';
        }
    };
    
    const handleSignUpWithGoogle = async (event) => {
        event.preventDefault();
        const { data, error } = await signInWithGoogle();
        if (error) {
          console.error("Error signing up with Google:", error.message);
          alert("Failed to sign up with Google!");
        } else {
          console.log("User signed up with Google:", data);
          window.location.href = '/login';
        }
    };
    
    return (
        <div className="bg-[#0e0e0e] flex flex-row justify-center w-full">
            <div className="bg-[#0e0e0e] overflow-hidden w-[1440px] h-[1024px]">
                <div className="relative w-[1387px] h-[936px] top-[60px] left-[60px]">
                    {/* Branding Section */}
                    <div className="absolute w-[751px] h-52 top-80 left-0">
                        <div className="absolute top-0 left-0 [font-family:'Noto_Sans-SemiBold',Helvetica] font-semibold text-white text-8xl tracking-[0] leading-[normal]">
                            ChatHaven
                        </div>
                        <div className="inline-flex items-start gap-2.5 px-6 py-3.5 absolute top-32 left-[9px] border-4 border-solid border-white">
                            <div className="relative w-fit [font-family:'Noto_Sans-DisplaySemiBold_Italic',Helvetica] font-semibold italic text-white text-[32px] tracking-[0] leading-[normal]">
                                Skip the lag ?
                            </div>
                        </div>
                    </div>
                    {/* Right Section with Form and Decorative Elements */}
                    <div className="absolute w-[652px] h-[936px] top-0 left-[735px]">
                        <div className="absolute w-[302px] h-[302px] top-0 left-0 rounded-[151px] [background:linear-gradient(180deg,rgb(25.14,0,96.69)_0%,rgb(10.16,27.48,47.81)_100%)]" />
                        <div className="absolute w-[220px] h-[220px] top-[677px] left-[393px] rounded-[110px] rotate-[-28.50deg] [background:linear-gradient(180deg,rgb(0,15.47,96.69)_0%,rgb(10.16,22.96,47.81)_100%)]" />
                        <div className="absolute w-[482px] h-[798px] top-[53px] left-[104px] rounded-[20px] overflow-hidden border border-solid border-transparent shadow-[-8px_4px_5px_#0000003d] backdrop-blur-[53px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(53px)_brightness(100%)] [border-image:linear-gradient(to_bottom,rgb(255,255,255),rgba(0,0,0,0))_1] [background:linear-gradient(180deg,rgba(191.25,191.25,191.25,0.06)_0%,rgba(0,0,0,0)_100%)]">
                            <div className="inline-flex flex-col items-center gap-[53px] relative top-[97px] left-10">
                                <div className="inline-flex flex-col items-start gap-4 relative flex-[0_0_auto]">
                                    <div className="inline-flex flex-col items-start gap-3.5 relative flex-[0_0_auto]">
                                        <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                                            <div className="text-4xl relative w-fit mt-[-1.00px] [font-family:'Noto_Sans-SemiBold',Helvetica] font-semibold text-white tracking-[0] leading-[normal]">
                                                Signup
                                            </div>
                                            <p className="relative w-fit [font-family:'Noto_Sans-Medium',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal]">
                                                Just some details to get you in.!
                                            </p>
                                        </div>

                                        <div className="inline-flex flex-col items-start gap-[25px] relative flex-[0_0_auto]">
                                            <input
                                                className="w-[400px] px-4 py-3.5 relative rounded-xl border border-solid border-white [background:none] mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]"
                                                id="signup_username"
                                                placeholder="Username"
                                                type="text"
                                                required
                                            />
                                            <input
                                                className="w-[400px] px-4 py-3.5 relative rounded-xl border border-solid border-white [background:none] mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]"
                                                id="signup_email"
                                                placeholder="Email"
                                                type="email"
                                                required
                                            />
                                            <input
                                                className="w-[400px] px-4 py-3.5 relative rounded-xl border border-solid border-white [background:none] mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]"
                                                id="signup_password"
                                                placeholder="Password"
                                                type="password"
                                                required
                                            />
                                            <input
                                                className="w-[400px] px-4 py-3.5 relative rounded-xl border border-solid border-white [background:none] mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]"
                                                id="signup_confirm_password"
                                                placeholder="Confirm Password"
                                                type="password"
                                                required={true}
                                            />

                                            {/* User Type Selection */}
                                            <div className="flex justify-center gap-4 mt-4">
                                                <button
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => setUserType("Member")}
                                                    className={`w-[200px] py-3.5 rounded-xl font-semibold transition-all transform duration-300 ease-in-out shadow-md text-lg flex items-center justify-center
                                                        ${userType === "Member" 
                                                            ? "bg-gradient-to-r from-green-400 to-green-600 text-white scale-105 border-2 border-green-300"
                                                            : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                                                        }`}
                                                >
                                                    Member
                                                </button>

                                                <button
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => setUserType("Admin")}
                                                    className={`w-[200px] py-3.5 rounded-xl font-semibold transition-all transform duration-300 ease-in-out shadow-md text-lg flex items-center justify-center
                                                        ${userType === "Admin" 
                                                            ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white scale-105 border-2 border-blue-300"
                                                            : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                                                        }`}
                                                >
                                                    Admin
                                                </button>
                                            </div>



                                            <div className="inline-flex flex-col items-center justify-center gap-3 relative flex-[0_0_auto]">
                                                <div className="flex w-[400px] items-center justify-center gap-2.5 px-2.5 py-3.5 rounded-xl [background:linear-gradient(180deg,rgb(45.62,76.4,238)_0%,rgb(33.5,30.28,191.25)_53.12%,rgb(3.9,15.19,116.88)_100%)] relative flex-[0_0_auto]">
                                                    <button
                                                        onClick={handleSignUpSubmit}
                                                        className="text-xl relative w-full h-full mt-[-1.00px] [font-family:'Noto_Sans-SemiBold',Helvetica] font-semibold text-white tracking-[0] leading-[normal]"
                                                    >
                                                        Signup
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="inline-flex flex-col items-center gap-3 relative flex-[0_0_auto]">
                                        <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
                                            <img className="relative w-[170px] h-0.5" alt="Line" src={line1} />
                                            <div className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans-Medium',Helvetica] font-medium text-[#4c4c4c] text-base tracking-[0] leading-[normal]">
                                                Or
                                            </div>
                                            <img className="relative w-[170px] h-0.5" alt="Line" src={line2} />
                                        </div>
                                        <img
                                            onClick={handleSignUpWithGoogle}
                                            role="button"
                                            tabIndex={0}
                                            className="relative flex-[0_0_auto] hover:scale-105"
                                            alt="Sign up with Google"
                                            src={google_icon}
                                        />
                                    </div>
                                </div>
                                <div className="inline-flex flex-col items-center gap-2 relative flex-[0_0_auto]">
                                    <a
                                        href="/login"
                                        className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans-Medium',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal] underline hover:scale-105"
                                    >
                                        Already Registered? Login
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <img className="absolute w-[575px] h-0.5 top-[488px] left-64" alt="Line" src={line3} />
                </div>
            </div>
        </div>
    );
};
