import React, { useState } from "react";

const IncomingMessage = ({ message }) => {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-700 text-white p-3 rounded-lg w-3/4">
        {message}
      </div>
    </div>
  );
};

const OutgoingMessage = ({ message }) => {
  return (
    <div className="flex justify-end">
      <div className="bg-blue-600 text-white p-3 rounded-lg w-3/4">
        {message}
      </div>
    </div>
  );
};

const MemberDM = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, isOutgoing: true }]);
      setInput("");
    }
  };

  return (
    <div className="bg-[#0e0523] h-screen flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center p-2 text-white border-b border-gray-700">
        <div className="w-8 h-8 bg-gray-400 rounded-full mr-2"></div>
        <span className="text-lg">laury_14</span>
      </div>
      
      {/* Chat Messages */}
      <div className="flex flex-col flex-grow p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          msg.isOutgoing ? (
            <OutgoingMessage key={index} message={msg.text} />
          ) : (
            <IncomingMessage key={index} message={msg.text} />
          )
        ))}
      </div>
      
      {/* Message Input */}
      <div className="p-2 border-t border-gray-700 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write message"
          className="flex-grow p-2 bg-gray-800 text-white rounded-lg outline-none"
        />
        <button onClick={handleSend} className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg">Send</button>
      </div>
    </div>
  );
};

export default MemberDM;
