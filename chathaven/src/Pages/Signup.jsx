import React, { useState } from "react";
import frame3 from "../icons/frame-3.svg";
import line1 from "../icons/line-1.svg";
import line2 from "../icons/line-2.svg";
import line3 from "../icons/line-3.svg";
import google_icon from "../icons/devicon_google.svg";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";


export const Signup = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(true);

    const handleSignUpWithGoogle = async (event) => {
        event.preventDefault();
        const firebaseConfig = {
            apiKey: "AIzaSyCV9udwRxAw-6THpvISvqlBDjmRnhIrTl4",
            authDomain: "project2048-38588.firebaseapp.com",
            projectId: "project2048-38588",
            storageBucket: "project2048-38588.firebasestorage.app",
            messagingSenderId: "24011303667",
            appId: "1:24011303667:web:f61673252279181abc2586",
            measurementId: "G-VM2LFE8HMR"
        };
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        try {
            await signOut(auth);
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("User signed up:", user);
        } catch (error) {
            console.error("Error signing up:", error.message);
        }
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
        setPasswordMatch(event.target.value === confirmPassword);
    };

    const handleConfirmPasswordChange = (event) => {
        setConfirmPassword(event.target.value);
        setPasswordMatch(event.target.value === password);
    };

    return (
        <div className="bg-[#0e0e0e] flex flex-row justify-center w-full">
            <div className="bg-[#0e0e0e] overflow-hidden w-[1440px] h-[1024px]">
                <div className="relative w-[1387px] h-[936px] top-[60px] left-[60px]">
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
                                                placeholder="Username"
                                                type="text"
                                                required
                                            />
                                            <input
                                                className="w-[400px] px-4 py-3.5 relative rounded-xl border border-solid border-white [background:none] mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]"
                                                placeholder="Email"
                                                type="email"
                                                required
                                            />
                                            <input
                                                className="w-[400px] px-4 py-3.5 relative rounded-xl border border-solid border-white [background:none] mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]"
                                                placeholder="Password"
                                                type="password"
                                                value={password}
                                                onChange={handlePasswordChange}
                                                required
                                            />
                                            <input
                                                className="w-[400px] px-4 py-3.5 relative rounded-xl border border-solid border-white [background:none] mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]"
                                                placeholder="Confirm Password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={handleConfirmPasswordChange}
                                                required
                                            />
                                            {!passwordMatch && (
                                                <div className="text-red-250 [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-base tracking-[0] leading-[normal]">
                                                    Passwords do not match
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex w-[200px] items-start justify-center gap-2.5 px-4 py-3.5 relative bg-[#2836d7] rounded-xl border border-solid border-black">
                                                    <div className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-[#fffefe] text-xl tracking-[0] leading-[normal]">
                                                        Member
                                                    </div>
                                                </div>
                                                <div className="flex w-[200px] items-start justify-center gap-2.5 px-4 py-3.5 relative rounded-xl border border-solid border-white">
                                                    <div className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans-Regular',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]">
                                                        Admin
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="inline-flex flex-col items-center justify-center gap-3 relative flex-[0_0_auto]">
                                                <div className="flex w-[400px] items-center justify-center gap-2.5 px-2.5 py-3.5 rounded-xl [background:linear-gradient(180deg,rgb(45.62,76.4,238)_0%,rgb(33.5,30.28,191.25)_53.12%,rgb(3.9,15.19,116.88)_100%)] relative flex-[0_0_auto]">
                                                    <button className="text-xl relative w-full h-full mt-[-1.00px] [font-family:'Noto_Sans-SemiBold',Helvetica] font-semibold text-white tracking-[0] leading-[normal]">
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
