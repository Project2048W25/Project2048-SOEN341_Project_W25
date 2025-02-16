import React from "react";
import '../styles/tailwind.CSS/tailwind.css'

export const OutgoingMessage = ({messageContent}) => {
    return (
        <div className="flex justify-end">
            <div className="bg-[#4880ff] text-white p-3 rounded-2xl max-w-[70%]">
                <p className="text-sm leading-6">{messageContent}</p>
            </div>
        </div>
    );
}
