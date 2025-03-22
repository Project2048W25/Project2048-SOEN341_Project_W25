import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import "./index.css";
import { supabase } from "../utils/supabaseClient";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";

// Helper: Parse a chat message and extract plain text and reply data if present.
export function parseChatMessage(message) {
  try {
    const parsed = JSON.parse(message);
    if (parsed && parsed.reply && parsed.message) {
      return { text: parsed.message, replyData: parsed.reply };
    }
  } catch (e) {
    // Not JSON or no reply structure.
  }
  return { text: message, replyData: null };
}

// Helper: Build a reply message JSON string.
export function buildReplyMessage(replyMessage, newInput, currentUser, friendProfile) {
  const { text: originalMessage } = parseChatMessage(replyMessage.message);
  const replyData = {
    message: originalMessage,
    sender: replyMessage.user_id === currentUser.id ? "You" : friendProfile.username || "Unknown",
    senderId: replyMessage.user_id,
  };
  return JSON.stringify({ reply: replyData, message: newInput });
}

// Helper: Format timestamp.
export function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString();
}

// ContextMenu Component
export const ContextMenu = ({ x, y, message, onClose, onReply, currentUser }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.message);
    onClose();
  };
  const handleDelete = () => {
    const confirmDelete = window.confirm("Delete this message?");
    if (confirmDelete) {
      supabase
        .from("dms")
        .delete()
        .eq("id", message.id)
        .then(({ error }) => {
          if (error) console.error("Error deleting message:", error);
        });
    }
    onClose();
  };
  const handleReply = () => {
    onReply(message);
    onClose();
  };

  return createPortal(
    <div
      onMouseLeave={onClose}
      style={{ position: "absolute", top: y, left: x }}
      className="flex flex-col w-[203px] p-1.5 bg-gray-800 rounded-lg shadow-lg"
    >
      <button
        onClick={handleCopy}
        className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition"
      >
        Copy message
      </button>
      {message.user_id === currentUser?.id && (
        <button
          onClick={handleDelete}
          className="w-full flex items-center px-3 py-2 text-red-400 hover:bg-gray-700 rounded-md transition"
        >
          Delete message
        </button>
      )}
      <button
        onClick={handleReply}
        className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition"
      >
        Reply
      </button>
    </div>,
    document.body
  );
};

// MessageItem Component
export const MessageItem = ({ msg, currentUser, username, setContextMenu }) => {
  const { text: messageText, replyData } = parseChatMessage(msg.message);
  const highlight = replyData && currentUser && replyData.senderId === currentUser.id;

  const handleContextMenu = (e) => {
    e.preventDefault();
    const menuWidth = 203;
    let x = e.clientX;
    if (x + menuWidth > window.innerWidth) x = e.clientX - menuWidth;
    setContextMenu({ visible: true, x, y: e.clientY, message: msg });
  };

  return (
    <div
      className={`message ${msg.user_id === currentUser?.id ? "outgoing" : "incoming"} ${highlight ? "highlighted" : ""}`}
      onContextMenu={handleContextMenu}
    >
      <div className="message-bundle">
        <div className="message-timestamp">{formatTimestamp(msg.created_at)}</div>
        <div className="message__outer">
          <div className="message__bubble">
            <div className="sender-name">
              {msg.user_id === currentUser?.id ? "You" : username || "Unknown"}
            </div>
            {replyData && (
              <div className="replied-message">
                <div className="replied-message-header">
                  <b>Replying to @{replyData.sender}:</b>
                </div>
                <div className="replied-message-content">"{replyData.message}"</div>
              </div>
            )}
            <div className="message-content">{messageText}</div>
          </div>
        </div>
        {msg.user_id === currentUser?.id && (
          <div className="message-status" style={{ textAlign: "right", marginTop: "4px" }}>
            {msg.seen ? "✔✔" : "✔"}
          </div>
        )}
      </div>
    </div>
  );
};

// ReplyPreview Component
export const ReplyPreview = ({ replyMessage, currentUser, friendProfile, onCancel }) => {
  const { text } = parseChatMessage(replyMessage.message);
  return (
    <div className="reply-preview">
      <div>
        <b>
          Replying to {replyMessage.user_id === currentUser?.id ? "You" : friendProfile.username || "Unknown"}:
        </b>{" "}
        "{text}"
      </div>
      <button className="cancel-reply" onClick={onCancel}>
        X
      </button>
    </div>
  );
};

// EmojiPicker Component
export const EmojiPicker = ({ emojiButtonRef, position, onSelect }) => (
  <div ref={emojiButtonRef} style={{ top: `${position.y}px`, left: `${position.x}px`, zIndex: 1000 }}>
    <Picker data={emojiData} navPosition={"bottom"} onEmojiSelect={onSelect} />
  </div>
);

const MemberDM = () => {
  const { username } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [replyMessage, setReplyMessage] = useState(null);
  const [friendProfile, setFriendProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, message: null });
  const emojiButtonRef = useRef(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [emojiWindowPosition, setEmojiWindowPosition] = useState({ x: 0, y: 0 });

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUser(user);
    };
    fetchUser();
  }, []);

  // Fetch friend profile (including last_seen)
  useEffect(() => {
    const fetchFriendProfile = async () => {
      const { data: friendData } = await supabase
        .from("profiles")
        .select("id, username, status, last_seen")
        .eq("username", username)
        .single();
      setFriendProfile(friendData);
    };
    if (username) fetchFriendProfile();
  }, [username]);

  // Fetch messages and subscribe to new ones
  useEffect(() => {
    if (!currentUser || !friendProfile) return;
    const fetchMessages = async () => {
      const { data: dms } = await supabase
        .from("dms")
        .select("*")
        .or(
          `and(user_id.eq.${currentUser.id},recipient_id.eq.${friendProfile.id}),and(user_id.eq.${friendProfile.id},recipient_id.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: true });
      setMessages(dms || []);
    };
    fetchMessages();
    const subscription = supabase
      .channel("dms")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dms" },
        (payload) => {
          const newMessage = payload.new;
          if (
            (newMessage.user_id === currentUser.id && newMessage.recipient_id === friendProfile.id) ||
            (newMessage.user_id === friendProfile.id && newMessage.recipient_id === currentUser.id)
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, [currentUser, friendProfile]);

  // Mark incoming messages as seen when conversation opens
  useEffect(() => {
    if (!currentUser || !friendProfile) return;
    const markMessagesAsSeen = async () => {
      const { error } = await supabase
        .from("dms")
        .update({ seen: true })
        .match({ recipient_id: currentUser.id, user_id: friendProfile.id, seen: false });
      if (error) console.error("Error marking messages as seen:", error);
    };
    markMessagesAsSeen();
  }, [currentUser, friendProfile]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiButtonRef.current && !emojiButtonRef.current.contains(event.target)) {
        setShowEmojis(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle emoji picker and record click position
  const handleEmojiButtonClick = (event) => {
    setShowEmojis((prev) => !prev);
    setEmojiWindowPosition({ x: event.clientX, y: event.clientY });
  };

  // Send message (handles replies)
  const handleSend = async () => {
    if (input.trim() && currentUser && friendProfile) {
      const finalMessage = replyMessage
        ? buildReplyMessage(replyMessage, input, currentUser, friendProfile)
        : input;
      const newMessage = {
        message: finalMessage,
        user_id: currentUser.id,
        recipient_id: friendProfile.id,
      };
      const { error } = await supabase.from("dms").insert(newMessage);
      if (error) console.error("Error sending message:", error);
      setInput("");
      setReplyMessage(null);
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
      {/* DM Header with last seen indicator */}
      <div className="dm-header">
        <span className="username">{username}</span>
        {friendProfile?.status && (
          <div className="user-status">
            <span className={`status-indicator ${(() => {
              switch (friendProfile.status) {
                case "online": return "status-online";
                case "away": return "status-away";
                case "offline": 
                default: return "status-offline";
              }
            })()}`}></span>
            <span className="status-text">
              {friendProfile.status.charAt(0).toUpperCase() + friendProfile.status.slice(1)}
            </span>
            {friendProfile.status === "offline" && friendProfile.last_seen && (
              <span className="last-seen" style={{ marginLeft: "8px" }}>
                - Last Seen: {formatTimestamp(friendProfile.last_seen)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            msg={msg}
            currentUser={currentUser}
            username={username}
            setContextMenu={setContextMenu}
          />
        ))}
      </div>

      {/* Reply Preview */}
      {replyMessage && friendProfile && (
        <ReplyPreview
          replyMessage={replyMessage}
          currentUser={currentUser}
          friendProfile={friendProfile}
          onCancel={() => setReplyMessage(null)}
        />
      )}

      {/* Emoji Picker */}
      {showEmojis && (
        <EmojiPicker
          emojiButtonRef={emojiButtonRef}
          position={emojiWindowPosition}
          onSelect={(emoji) => setInput(input + emoji.native)}
        />
      )}

      {/* Message Input */}
      <div className="chat-input-container">
        <button type="button" onClick={handleEmojiButtonClick} className="emoji-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="white"
            className="react-input-emoji--button--icon"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0" />
            <path d="M8 7a2 2 0 1 0-.001 3.999A2 2 0 0 0 8 7M16 7a2 2 0 1 0-.001 3.999A2 2 0 0 0 16 7M15.232 15c-.693 1.195-1.87 2-3.349 2-1.477 0-2.655-.805-3.347-2H15m3-2H6a6 6 0 1 0 12 0" />
          </svg>
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write message"
          className="chat-input"
        />
        <button onClick={handleSend} className="send-button">
          Send
        </button>
      </div>

      {/* Render Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          message={contextMenu.message}
          onClose={() => setContextMenu({ ...contextMenu, visible: false, message: null })}
          onReply={(msg) => setReplyMessage(msg)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default MemberDM;
