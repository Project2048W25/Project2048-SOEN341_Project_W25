import React from "react";
import '../styles/tailwind.CSS/tailwind.css'
import logo from "../logo.svg";

export const IncomingMessage = ({messageContent}) => {
    return (
        <div className="flex items-start gap-2">
            <img className="rounded-full w-12 h-12" alt="incoming user logo" src={logo} />
            <div className="bg-[#323c4e] text-white p-3 rounded-2xl border border-[#cfcfcf1d] max-w-[70%]">
                <p className="text-sm leading-6">{messageContent}</p>
            </div>
        </div>
    );
}
