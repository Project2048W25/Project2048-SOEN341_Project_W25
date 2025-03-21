import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { createPortal } from "react-dom";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import "./index.css";

export const ChannelDM = () => {
  const { channelId } = useParams();

  const [channelName, setChannelName] = useState("Loading...");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [replyMessage, setReplyMessage] = useState(null); // state for reply

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [teamOwnerId, setTeamOwnerId] = useState(null);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    message: null,
  });

  // States and ref for the emoji picker
  const emojiButtonRef = useRef(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [emojiWindowPosition, setEmojiWindowPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Click outside to close emoji picker
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

  useEffect(() => {
    // Fetch user & role
    const fetchUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profileData) {
          setRole(profileData.role);
        }
      }
    };

    // Fetch channel details (including team info)
    const fetchChannelDetails = async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("title, team_id, teams(owner_id)")
        .eq("id", channelId)
        .single();

      if (error || !data) {
        console.error("Error fetching channel info:", error);
        setChannelName("Unknown Channel");
      } else {
        setChannelName(data.title);
        if (data.teams) {
          setTeamOwnerId(data.teams.owner_id);
        }
      }
    };

    // Fetch messages joined with profiles
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, message, user_id, created_at, channel_id, profiles(username)")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true });
      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
    };

    fetchUserAndRole();
    fetchChannelDetails();
    fetchMessages();

    // Real-time subscription for messages INSERT and DELETE
    const messageSubscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new.channel_id === channelId) {
            (async () => {
              const newMsg = payload.new;
              const { data: profileData, error } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", newMsg.user_id)
                .single();
              if (!error && profileData) {
                newMsg.profiles = { username: profileData.username };
              }
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            })();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          if (payload.old.channel_id === channelId) {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [channelId]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    let finalMessage = input;
    // If replying, include reply metadata with senderId.
    if (replyMessage) {
      const replyData = {
        message: replyMessage.message,
        sender: replyMessage.user_id === user?.id ? "You" : replyMessage.profiles?.username || "Unknown",
        senderId: replyMessage.user_id,
      };
      finalMessage = JSON.stringify({ reply: replyData, message: input });
    }
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          message: finalMessage,
          channel_id: channelId,
          user_id: user.id,
        },
      ])
      .select();
    if (error) {
      console.error("Error sending message:", error);
    } else if (data && data.length > 0) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data[0].id)) return prev;
        return [...prev, data[0]];
      });
      setInput("");
      setReplyMessage(null); // clear reply after sending
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // Handler to toggle emoji picker
  const handleEmojiButtonClick = (event) => {
    setShowEmojis((prev) => !prev);
    setEmojiWindowPosition({ x: event.clientX, y: event.clientY });
  };

  // Extended Context Menu with Reply option
  const ContextMenu = ({ x, y, message, onClose, onReply }) => {
    const handleCopy = () => {
      navigator.clipboard.writeText(message.message);
      onClose();
    };

    const handleDelete = () => {
      const confirmDelete = window.confirm("Delete this message?");
      if (confirmDelete) {
        supabase
          .from("messages")
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
        {((role === "Admin") || (teamOwnerId === user?.id)) && (
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
      <div className="dm-header">
        <span className="username">#{channelName}</span>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => {
          // Attempt to parse the message as a reply structure
          let messageText = msg.message;
          let replyData = null;
          try {
            const parsed = JSON.parse(msg.message);
            if (parsed && parsed.reply && parsed.message) {
              replyData = parsed.reply;
              messageText = parsed.message;
            }
          } catch (e) {
            // Not a JSON structure, so render as plain text.
          }
          // Determine if this message should be highlighted (only for the user being replied to)
          const highlight = replyData && user && replyData.senderId === user.id;
          return (
            <div
              key={msg.id}
              className={`message ${
                msg.user_id === user?.id ? "outgoing" : "incoming"
              } ${highlight ? "highlighted" : ""}`}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({
                  visible: true,
                  x: e.clientX,
                  y: e.clientY,
                  message: msg,
                });
              }}
            >
              <div className="message-bundle">
                <div className="message-timestamp">
                  {new Date(msg.created_at).toLocaleString()}
                </div>
                <div className="message__outer">
                  <div className="message__bubble">
                    <div className="sender-name">
                      {msg.user_id === user?.id ? "You" : msg.profiles?.username || "Unknown"}
                    </div>
                    {/* Render replied message box if reply metadata is available */}
                    {replyData && (
                      <div className="replied-message">
                        <div className="replied-message-header">
                          <b>Replying to @{replyData.sender}:</b>
                        </div>
                        <div className="replied-message-content">
                          "{replyData.message}"
                        </div>
                      </div>
                    )}
                    <div className="message-content">{messageText}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Reply preview above chat input */}
      {replyMessage && (
        <div className="reply-preview">
          <div>
            <b>
              Replying to @{replyMessage.user_id === user?.id ? "You" : replyMessage.profiles?.username || "Unknown"}:
            </b>{" "}
            "{replyMessage.message}"
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
        <button className="send-button" onClick={handleSend}>
          Send
        </button>
      </div>
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          message={contextMenu.message}
          onClose={() =>
            setContextMenu({ ...contextMenu, visible: false, message: null })
          }
          onReply={(msg) => setReplyMessage(msg)}
        />
      )}
    </div>
  );
};

export default ChannelDM;
