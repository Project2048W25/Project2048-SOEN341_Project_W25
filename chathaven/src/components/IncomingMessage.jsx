import React, {useEffect, useRef, useState} from "react";
import '../styles/tailwind.CSS/tailwind.css'
import logo from "../assets/logo.svg";
import {ContextMenu} from "./ContextMenu";



export const IncomingMessage = ({messageContent}) => {
    const [contextMenu, setContextMenu] = useState(null);
    const msgHolderRef = useRef(null);

    // Handle Right-Click (Context Menu)
    const handleContextMenu = (event) => {
        event.preventDefault(); // Prevent default browser menu

        // Show menu at mouse position
        setContextMenu({ x: event.pageX, y: event.pageY });
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (msgHolderRef.current && !msgHolderRef.current.contains(event.target)) {
                setContextMenu(null);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);
    return (
        <div


            className="flex items-start gap-2">

            <img className="rounded-full w-12 h-12" alt="incoming user logo" src={logo} />
            <div className="bg-[#323c4e] text-white p-3 rounded-2xl border border-[#cfcfcf1d] max-w-[70%]" ref={msgHolderRef} onContextMenu={handleContextMenu}>
                {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} />}
                <p className="text-sm leading-6">{messageContent}</p>
            </div>
        </div>
    );
}
