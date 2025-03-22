import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import "./index.css";
import { supabase } from "../utils/supabaseClient";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";

export const MemberDM = () => {
  const { username } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [replyMessage, setReplyMessage] = useState(null); // For quoting/reply feature
  const [friendProfile, setFriendProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    message: null,
  });

  // Emoji picker state and ref
  const emojiButtonRef = useRef(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [emojiWindowPosition, setEmojiWindowPosition] = useState({ x: 0, y: 0 });

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    fetchUser();
  }, []);

  // Fetch friend profile with last_seen field
  useEffect(() => {
    const fetchFriendProfile = async () => {
      const { data: friendData } = await supabase
        .from("profiles")
        .select("id, username, status, last_seen")
        .eq("username", username)
        .single();
      setFriendProfile(friendData);
    };

    if (username) {
      fetchFriendProfile();
    }
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
        {
          event: "INSERT",
          schema: "public",
          table: "dms",
        },
        (payload) => {
          const newMessage = payload.new;
          if (
            (newMessage.user_id === currentUser.id &&
              newMessage.recipient_id === friendProfile.id) ||
            (newMessage.user_id === friendProfile.id &&
              newMessage.recipient_id === currentUser.id)
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser, friendProfile]);

  // Mark incoming messages as seen when conversation opens
  useEffect(() => {
    if (!currentUser || !friendProfile) return;
    const markMessagesAsSeen = async () => {
      const { error } = await supabase
        .from("dms")
        .update({ seen: true })
        .match({ recipient_id: currentUser.id, user_id: friendProfile.id, seen: false });
      if (error) {
        console.error("Error marking messages as seen:", error);
      }
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle emoji picker and store click position
  const handleEmojiButtonClick = (event) => {
    setShowEmojis((prev) => !prev);
    setEmojiWindowPosition({ x: event.clientX, y: event.clientY });
  };

  // Send message (with reply wrapping if applicable)
  const handleSend = async () => {
    if (input.trim() && currentUser && friendProfile) {
      let finalMessage = input;
      if (replyMessage) {
        let originalMessage = replyMessage.message;
        try {
          const parsedReply = JSON.parse(replyMessage.message);
          if (parsedReply && parsedReply.reply && parsedReply.message) {
            originalMessage = parsedReply.message;
          }
        } catch (e) {
          // Not a nested reply; keep originalMessage as is.
        }
        const replyData = {
          message: originalMessage,
          sender: replyMessage.user_id === currentUser.id ? "You" : friendProfile.username || "Unknown",
          senderId: replyMessage.user_id,
        };
        finalMessage = JSON.stringify({ reply: replyData, message: input });
      }
      const newMessage = {
        message: finalMessage,
        user_id: currentUser.id,
        recipient_id: friendProfile.id,
      };

      const { error } = await supabase.from("dms").insert(newMessage);
      if (error) {
        console.error("Error sending message:", error);
      }
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

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const dateObj = new Date(timestamp);
    return dateObj.toLocaleString();
  };

  // Determine status class for friend
  const getStatusClass = (status) => {
    switch (status) {
      case "online":
        return "status-online";
      case "away":
        return "status-away";
      case "offline":
      default:
        return "status-offline";
    }
  };

  // Extended Context Menu with reply, copy, and delete options
  const ContextMenu = ({ x, y, message, onClose, onReply }) => {
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
            if (error) {
              console.error("Error deleting message:", error);
            } else {
              setMessages((prev) => prev.filter((m) => m.id !== message.id));
            }
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

  return (
    <div className="main-container">
      {/* DM Header with last seen indicator */}
      <div className="dm-header">
        <span className="username">{username}</span>
        {friendProfile?.status && (
          <div className="user-status">
            <span className={`status-indicator ${getStatusClass(friendProfile.status)}`}></span>
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
        {messages.map((msg) => {
          let messageText = msg.message;
          let replyData = null;
          try {
            const parsed = JSON.parse(msg.message);
            if (parsed && parsed.reply && parsed.message) {
              replyData = parsed.reply;
              messageText = parsed.message;
            }
          } catch (e) {
            // Not a JSON structure; display plain text.
          }
          const highlight = replyData && currentUser && replyData.senderId === currentUser.id;
          return (
            <div
              key={msg.id}
              className={`message ${msg.user_id === currentUser?.id ? "outgoing" : "incoming"} ${highlight ? "highlighted" : ""}`}
              onContextMenu={(e) => {
                e.preventDefault();
                const menuWidth = 203;
                let x = e.clientX;
                if (x + menuWidth > window.innerWidth) {
                  x = e.clientX - menuWidth;
                }
                setContextMenu({
                  visible: true,
                  x,
                  y: e.clientY,
                  message: msg,
                });
              }}
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
        })}
      </div>

      {/* Reply preview */}
      {replyMessage && (
        <div className="reply-preview">
          <div>
            <b>
              Replying to @{replyMessage.user_id === currentUser?.id ? "You" : friendProfile.username || "Unknown"}:
            </b>{" "}
            "
            {(() => {
              let previewMsg = replyMessage.message;
              try {
                const parsedReply = JSON.parse(replyMessage.message);
                if (parsedReply && parsedReply.reply && parsedReply.message) {
                  previewMsg = parsedReply.message;
                }
              } catch (e) {
                // Not a nested reply.
              }
              return previewMsg;
            })()}
            "
          </div>
          <button className="cancel-reply" onClick={() => setReplyMessage(null)}>
            X
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojis && (
        <div
          ref={emojiButtonRef}
          style={{
            top: `${emojiWindowPosition.y}px`,
            left: `${emojiWindowPosition.x}px`,
            zIndex: 1000,
          }}
        >
          <Picker
            data={emojiData}
            navPosition={"bottom"}
            onEmojiSelect={(emoji) => setInput(input + emoji.native)}
          />
        </div>
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
        />
      )}
    </div>
  );
};

export default MemberDM;
