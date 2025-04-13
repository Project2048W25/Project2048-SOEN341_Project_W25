import React from "react";
import { ReactComponent as TrashIcon } from "../../public/icons/trash.svg";
import {createPortal} from "react-dom";

// ✅ Simple Divider Component

// ✅ Menu Items Array
const menuItems = [
    { label: "Copy message" },
    { label: "Flag message" },
];

// ✅ Context Menu Component
export const ContextMenu = ({x,y , onClose}) => {
    // x and y are the mouse coordinates
    // onClose is a function to close the context menu
    return createPortal(
        <div
        onMouseLeave={onClose} // close menu on mouse leave
            className="flex flex-col w-[203px] p-1.5 bg-gray-800 rounded-lg shadow-lg" style={{ position: "absolute", top: y, left: x }}>


            {/* Menu Items */}
            {menuItems.map((item, index) => (
                <button
                    key={index}
                    className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition"
                >
                    {item.label}
                </button>
            ))}

            {/* Delete Option should be available only if user admin privileges */}
            <button className="w-full flex items-center px-3 py-2 text-red-400 hover:bg-gray-700 rounded-md transition">
                Delete message <TrashIcon className="absolute right-1.5 w-4 h-4 mr-2" />
            </button>
        </div>
        , document.body // render into current body
    );
};