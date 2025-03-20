import React, { useState } from "react";
import google_icon from "../icons/devicon_google.svg";
import { signInWithGoogle } from "../services/authService";
import { signUpUser } from "../services/userService";

export const Signup = () => {
    const [userType, setUserType] = useState("Member");

    const handleSignUpSubmit = async (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const email = event.target.email.value;
        const password = event.target.password.value;
        const confirmPassword = event.target.confirmPassword.value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const { data, error } = await signUpUser(email, password, {
            username,
            role: userType,
        });
        if (error) {
            alert(`Error signing up: ${error.message}`);
        } else {
            window.location.href = '/login';
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-semibold text-white text-center md:text-left">ChatHaven</h1>
            <div className="w-full max-w-sm md:w-[400px] lg:w-[482px] rounded-2xl border border-white shadow-lg backdrop-blur-lg p-6 mt-6">
                <h2 className="text-2xl font-semibold text-white text-center">Signup</h2>
                <p className="text-white text-sm text-center">Create your account in seconds!</p>

                <form className="mt-6 space-y-4" onSubmit={handleSignUpSubmit}>
                    <input type="text" name="username" placeholder="Username" required className="w-full px-4 py-3 rounded-xl border border-white bg-transparent text-white text-xl" />
                    <input type="email" name="email" placeholder="Email" required className="w-full px-4 py-3 rounded-xl border border-white bg-transparent text-white text-xl" />
                    <input type="password" name="password" placeholder="Password" required className="w-full px-4 py-3 rounded-xl border border-white bg-transparent text-white text-xl" />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" required className="w-full px-4 py-3 rounded-xl border border-white bg-transparent text-white text-xl" />

                    {/* User Type Selection */}
                    <div className="flex justify-center gap-4 mt-4">
                        <button type="button" onClick={() => setUserType("Member")} className={`w-1/2 py-3 rounded-xl font-semibold transition-all transform duration-300 shadow-md text-lg flex items-center justify-center
                            ${userType === "Member" ? "bg-gradient-to-r from-green-400 to-green-600 text-white scale-105 border-2 border-green-300" : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"}`}>Member</button>
                        <button type="button" onClick={() => setUserType("Admin")} className={`w-1/2 py-3 rounded-xl font-semibold transition-all transform duration-300 shadow-md text-lg flex items-center justify-center
                            ${userType === "Admin" ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white scale-105 border-2 border-blue-300" : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"}`}>Admin</button>
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl text-xl text-white bg-gradient-to-b from-blue-400 to-purple-700 hover:scale-105">
                        Signup
                    </button>
                </form>

                <div className="text-center my-4 text-gray-400 text-sm">Or</div>

                <img className="block mx-auto hover:scale-105 cursor-pointer" alt="Sign up with Google" src={google_icon} onClick={signInWithGoogle} />

                <div className="text-center mt-4">
                    <a href="/login" className="text-white text-sm underline hover:scale-105">Already Registered? Login</a>
                </div>
            </div>
        </div>
    );
};
