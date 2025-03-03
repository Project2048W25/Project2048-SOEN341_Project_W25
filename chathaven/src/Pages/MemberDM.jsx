import { useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css";

export const MemberDM = () => {
  const { username } = useParams(); // Friend's username from the URL
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Handle sending message: adds message to local state
  const handleSend = () => {
    if (input.trim()) {
      // For outgoing messages, label as "You"
      setMessages([...messages, { sender: "You", text: input, isOutgoing: true }]);
      setInput("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="main-container">
      {/* DM Header */}
      <div className="dm-header">
        <span className="username">{username}</span>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isOutgoing ? "outgoing" : "incoming"}`}>
            <div className="message__outer">
              <div className="message__bubble">
                <strong>{msg.isOutgoing ? "You" : username}:</strong> {msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write message"
          className="chat-input"
        />
        <button onClick={handleSend} className="send-button">Send</button>
      </div>
    </div>
  );
};

export default MemberDM;
