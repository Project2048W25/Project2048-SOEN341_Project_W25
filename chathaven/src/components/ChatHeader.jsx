import pending_message_icon from "../icons/pending_message_icon.svg";
import React from "react";

export const ChatHeader = () => {
    return (
        <div className=" flex items-center  p-4 border-b border-[#313d4f] align-right">
            <p className="ml-auto text-xl text-right font-bold mr-1 pr-1 font-extrabold">ChatHaven</p>
            <img src={pending_message_icon} alt="chatHaven logo" className="ml-2" />
        </div>
    );
}