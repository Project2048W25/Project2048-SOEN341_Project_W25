import React from "react";
import closedEye from "../icons/closed-eye.svg";
import google_icon from "../icons/devicon_google.svg";
import { signInWithEmail, signInWithGoogle } from "../services/authService";
import { getProfileByUsername } from "../services/profileService";

const Login = () => {
    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;

        const { data: profileData, error: profileError } = await getProfileByUsername(username);
        if (profileError || !profileData?.length) {
            alert("User does not exist or an error occurred.");
            return;
        }

        const profile = profileData[0];
        if (profile.password !== password) {
            alert("Invalid password.");
            return;
        }

        const { error } = await signInWithEmail(profile.email, password);
        if (error) {
            alert("Error signing in: " + error.message);
            return;
        }

        window.location.href = "/app";
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-semibold text-white text-center md:text-left">ChatHaven</h1>
            <div className="w-full max-w-sm md:w-[400px] lg:w-[482px] rounded-2xl border border-white shadow-lg backdrop-blur-lg p-6 mt-6">
                <h2 className="text-2xl font-semibold text-white text-center">Login</h2>
                <p className="text-white text-sm text-center">Glad you’re back!</p>

                <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
                    <input type="text" name="username" placeholder="Username" required className="w-full px-4 py-3 rounded-xl border border-white bg-transparent text-white text-xl" />

                    <div className="relative">
                        <input type="password" name="password" placeholder="Password" required className="w-full px-4 py-3 rounded-xl border border-white bg-transparent text-white text-xl" />
                        <img className="absolute right-4 top-3 w-6 h-6 cursor-pointer" alt="Toggle password visibility" src={closedEye} onClick={(e) => {
                            const passwordField = e.target.previousSibling;
                            passwordField.type = passwordField.type === "password" ? "text" : "password";
                        }} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="remember_me" className="w-4 h-4" />
                        <label htmlFor="remember_me" className="text-white text-sm">Remember me</label>
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl text-xl text-white bg-gradient-to-b from-blue-400 to-purple-700 hover:scale-105">
                        Login
                    </button>
                </form>

                <div className="text-center my-4 text-gray-400 text-sm">Or</div>

                <img className="block mx-auto hover:scale-105 cursor-pointer" alt="Sign in with Google" src={google_icon} onClick={signInWithGoogle} />

                <div className="text-center mt-4">
                    <a href="/signup" className="text-white text-sm underline hover:scale-105">Don’t have an account? Signup</a>
                </div>
            </div>
        </div>
    );
};

export default Login;