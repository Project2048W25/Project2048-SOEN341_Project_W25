import React from "react";
import '../styles/tailwind.CSS/tailwind.css'
import logo from "../assets/logo.svg";
import more from "../assets/icons/more.svg";



// ✅ User & Team Components
function UserDirectMessage({ name, username }) {
    return (
        <div className="flex items-center gap-3 p-2 hover:bg-[#26264f] rounded-md cursor-pointer">
            <img className="rounded-full w-10 h-10" alt="user logo" src={logo} />
            <div>
                <div className="font-bold text-white text-sm">{name}</div>
                <div className="text-white text-xs opacity-80">{username}</div>
            </div>
        </div>
    );
}

function TeamDirectMessage({ teamName }) {
    return (
        <div className="flex items-center gap-3 p-2 hover:bg-[#26264f] rounded-md cursor-pointer">
            <img className="rounded-full w-10 h-10" alt="team logo" src={logo} />
            <div className="font-bold text-white text-sm">{teamName}</div>
        </div>
    );
}

export const SideBar = () => {
    return (
    <div className="w-[20%] h-full bg-[#190061] flex flex-col p-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#313d4f]">
            <img className="rounded-full w-12 h-12" alt="admin logo" src={logo} />
            <div>
                <div className="font-bold text-white">Moni Roy</div>
                <div className="text-xs text-white opacity-75">Admin</div>
            </div>
            <img className="w-5 h-5 cursor-pointer" alt="More" src={more} />
        </div>

        {/* Direct Messages Section */}
        <h2 className="text-white text-sm font-semibold mt-4 mb-2">Direct Messages</h2>
        <div className="flex flex-col space-y-2 overflow-y-visible overdlow-y-auto">
            <UserDirectMessage name="Ben" username="ben123" />
            <UserDirectMessage name="Laury" username="laury456" />
            <button
                className="w-full h-[50px] mt-auto flex justify-center items-center font-semibold text-white text-sm
                                       bg-[#1a1a2e] rounded-md transition duration-300 hover:bg-[#324A5F]">
                add a new user
            </button>
        </div>

        {/* Teams Section */}
        <h2 className="text-white text-sm font-semibold mt-4 mb-2">Teams</h2>
        <div className="flex flex-col space-y-2 overflow-y-visible overdlow-y-auto">
            <TeamDirectMessage teamName="SOEN_club" />
            <TeamDirectMessage teamName="Web Devs" />
            {/* button to add new team if needed */}
            <button
                className="w-full h-[50px] mt-auto flex justify-center items-center font-semibold text-white text-sm
                                       bg-[#1a1a2e] rounded-md transition duration-300 hover:bg-[#324A5F]">
                add new team
            </button>
        </div>

        {/* Settings & Logout */}
        <div className="mt-auto border-t border-[#313d4f] pt-4">
            {["Settings", "Logout"].map((text) => (
                <button
                    key={text}
                    className="w-full h-[50px] flex justify-center items-center font-semibold text-white text-sm
                                       bg-[#1a1a2e] rounded-md transition duration-300 hover:bg-[#324A5F]"
                >
                    {text}
                </button>
            ))}
        </div>
    </div>
    );
}