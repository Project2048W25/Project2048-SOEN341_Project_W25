import React, {useEffect, useRef, useState} from "react";
import '../styles/tailwind.CSS/tailwind.css'
import {ContextMenu} from "./ContextMenu";

export const OutgoingMessage = ({messageContent}) => {
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
        document.addEventListener("mouseout", handleClickOutside);
        return () => {document.removeEventListener("click", handleClickOutside) && document.removeEventListener("mouseout", handleClickOutside)};
    }, []);
    return (

        <div className="flex justify-end">
            <div className="bg-[#4880ff] text-white p-3 rounded-2xl max-w-[70%]" ref={msgHolderRef} onContextMenu={handleContextMenu}>
                {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} />}
                <p className="text-sm leading-6">{messageContent}</p>
            </div>
        </div>
    );
}
