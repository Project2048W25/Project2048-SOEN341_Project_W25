import React from "react";
import "../styles/tailwind.CSS/tailwind.css";
import {SideBar} from "../components/SideBar";
import {ActiveChatView} from "../components/ActiveChatView";
import {ChatHeader} from "../components/ChatHeader";

export const TeamAdminView = () => {

    return (
        <div className="flex w-screen h-screen bg-[#10003e]">

            {/* Sidebar */}
            <SideBar />
            {/* Chat Section */}
            <ActiveChatView />
        </div>
        // <TeamAdminEmptyView />
    );
};

// this component should be shown when no active chat i.e. admin has not selected any chat to view. this should be default page to view when admin logs in.
// see figma design for reference: https://www.figma.com/design/tZeCwvbmy2IjKpUboU79CS/Project2048---ChatHaven?node-id=192-71&m=dev
function TeamAdminEmptyView(){
    return (
        <div className="flex flex-row w-screen h-screen bg-[#10003e]">
            {/*SideBar*/}
            <SideBar />
            {/* Chat Header */}
            {/*<ChatHeader />*/}
            <div className="flex flex-col flex-grow p-6 space-y-4 justify-center items-center">
                <p className="text-white text-2xl">Welcome to ChatHaven.</p>
                <p className="text-white text-lg">You are now an admin. Start creating your team</p>
                <button
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">+ Create Team</button>
            </div>

        </div>
    );
}
