import React, {useState} from "react";
import "../styles/tailwind.CSS/tailwind.css";
import {IncomingMessage} from "../components/IncomingMessage";
import {OutgoingMessage} from "../components/OutgoingMessage";
import {ChatHeader} from "../components/ChatHeader";
export const ActiveChatView = () => {
    const [messages, setMessages] = useState(
        [
            // THIS ARRAY MAY BE USED TO SHOW SOME INITIAL MESSAGES
            // { type: "incoming", content: "" },
            // { type: "outgoing", content: "" },
            // { type: "incoming", content: "" }
        ]);

    const [inputMessage, setInputValue] = useState("");

    // funcions used thorughout the component
    const handleSendMessage = () => {
        const getTypedMessage = inputMessage.trim();
        if (inputMessage.trim() !== "") {
            setMessages([...messages, { type: "outgoing", content: getTypedMessage }]);
            setInputValue("");
        }
        else { // if input text is empty, do nothing and clear the input field
            setInputValue("");
        }
    }
    return (

        <div className="flex flex-col flex-grow bg-[#0e0038] border border-[#313d4f]">

            {/* Chat Header */}
            <ChatHeader />
            {/* Messages Area*/}
            <div className="flex flex-col flex-grow p-6 space-y-4 overflow-y-auto">
                <IncomingMessage
                    messageContent={"Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
                        "Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. " +
                        "Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. " +
                        "Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla."} />
                <OutgoingMessage
                    messageContent={"Cras ultricies ligula sed magna dictum porta. " +
                        "Nulla quis lorem ut libero malesuada feugiat. " +
                        "Donec sollicitudin molestie malesuada. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. " +
                        "Donec rutrum congue leo eget malesuada. Sed porttitor lectus nibh. Cras ultricies ligula sed magna dictum porta."}
                />
                <IncomingMessage
                    messageContent={"Pellentesque in ipsum id orci porta dapibus. Nulla quis lorem ut libero malesuada feugiat. " +
                        "Curabitur aliquet quam id dui posuere blandit. " +
                        "Vivamus suscipit tortor eget felis porttitor volutpat. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. " +
                        "Cras ultricies ligula sed magna dictum porta. Proin eget tortor risus."}
                />
                {
                    messages.map(
                        (message, index) =>
                            message.content &&
                            message.type === "incoming"  ? (
                                <IncomingMessage key={index} messageContent={"Empty for now - backend to fix"}/>
                            ) : (
                                <OutgoingMessage key={index} messageContent={message.content} />
                            )

                    )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-[#313d4f]"></div>

            {/* Input & Send Button */}
            <div className="flex items-center gap-2 p-3 border-t border-[#313d4f]">

                <input
                    type="text"
                    value={inputMessage}
                    className="flex-grow h-12 px-4 text-white text-base bg-transparent
                                   border-2 border-white rounded-md"
                    placeholder="Write message"
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button
                    className="w-32 h-12 bg-[#4880ff] text-white font-semibold text-xs rounded-md"
                    onClick = {handleSendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    )
}