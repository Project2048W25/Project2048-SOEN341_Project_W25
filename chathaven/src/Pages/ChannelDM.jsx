import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { createPortal } from "react-dom";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import "./index.css";
import { MdScheduleSend } from "react-icons/md";
import { FiPaperclip } from "react-icons/fi"; // Media button icon

// Helper: get file extension from URL
const getFileExtension = (url) => {
  const cleanUrl = url.split('?')[0];
  return cleanUrl.substring(cleanUrl.lastIndexOf('.') + 1).toLowerCase();
};

// Helper: detect media type based on file extension
const detectMediaType = (url) => {
  const ext = getFileExtension(url);
  if (["png", "jpg", "jpeg", "gif"].includes(ext)) return "image";
  if (ext === "mp4") return "video";
  if (ext === "mp3") return "audio";
  return null;
};

export const ChannelDM = () => {
  const { channelId } = useParams();

  const [channelName, setChannelName] = useState("Loading...");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [replyMessage, setReplyMessage] = useState(null); // state for reply
  const [mediaFile, setMediaFile] = useState(null); // state for media file

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [teamOwnerId, setTeamOwnerId] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

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

  // Ref for media file input
  const mediaInputRef = useRef(null);

  // onPaste handler for clipboard images
  const handlePaste = (e) => {
    const clipboardData = e.clipboardData;
    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        setMediaFile(blob);
        e.preventDefault();
        break;
      }
    }
  };

  // Define ContextMenu inside the component so it's in scope.
  const ContextMenu = ({ x, y, message, onClose, onReply, role, teamOwnerId, user }) => {
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
        .select("id, message, user_id, created_at, channel_id, profiles(username), media_url, media_type")
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

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !mediaFile) return;

    let finalMessage = input;
    // Check if this is a pasted media link (URL)
    if (
      !mediaFile &&
      input.trim().startsWith("http") &&
      input.includes("supabase.co/storage") &&
      input.includes("chat-media")
    ) {
      const media_url = input.trim();
      const media_type = detectMediaType(media_url);
      finalMessage = "";
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            message: finalMessage,
            channel_id: channelId,
            user_id: user.id,
            media_url,
            media_type,
          },
        ])
        .select();
      if (error) {
        console.error("Error sending media message:", error);
      } else if (data && data.length > 0) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data[0].id)) return prev;
          return [...prev, data[0]];
        });
      }
      setInput("");
      return;
    }

    // If replying, include reply data (propagating media info if present)
    if (replyMessage) {
      let originalMessage = replyMessage.message;
      try {
        const parsedReply = JSON.parse(replyMessage.message);
        if (parsedReply && parsedReply.reply && parsedReply.message) {
          originalMessage = parsedReply.message;
        }
      } catch (e) {
        // Not a JSON structure.
      }
      const replyData = {
        message: originalMessage,
        sender: replyMessage.user_id === user?.id ? "You" : replyMessage.profiles?.username || "Unknown",
        senderId: replyMessage.user_id,
        ...(replyMessage.media_url && {
          media_url: replyMessage.media_url,
          media_type: replyMessage.media_type,
        }),
      };
      finalMessage = JSON.stringify({ reply: replyData, message: input });
    }

    let media_url = null;
    let media_type = null;
    if (mediaFile) {
      const filePath = `media/${user.id}-${Date.now()}-${mediaFile.name}`;
      const { error: uploadError } = await supabase.storage.from("chat-media").upload(filePath, mediaFile);
      if (uploadError) {
        console.error("Error uploading media:", uploadError);
        return;
      }
      const { data: { publicUrl } = {} } = supabase.storage.from("chat-media").getPublicUrl(filePath);
      media_url = publicUrl;
      media_type = mediaFile.type;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          message: finalMessage,
          channel_id: channelId,
          user_id: user.id,
          ...(media_url && { media_url }),
          ...(media_type && { media_type }),
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
      setReplyMessage(null);
      setMediaFile(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiButtonClick = (event) => {
    setShowEmojis((prev) => !prev);
    setEmojiWindowPosition({ x: event.clientX, y: event.clientY });
  };

  const handleSchedulerClick = () => {
    setShowDatePicker(true);
  };

  const handleSave = () => {
    console.log("Selected time:", selectedTime);
    setShowDatePicker(false);
  };

  return (
    <div className="main-container">
      <div className="dm-header">
        <span className="username">#{channelName}</span>
      </div>
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
            // Not a JSON structure, so render as plain text.
          }
          const highlight = replyData && user && replyData.senderId === user.id;
          return (
            <div
              key={msg.id}
              className={`message ${msg.user_id === user?.id ? "outgoing" : "incoming"} ${highlight ? "highlighted" : ""}`}
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
                    {replyData && (
                      <div className="replied-message">
                        <div className="replied-message-header">
                          <b>Replying to @{replyData.sender}:</b>
                        </div>
                        <div className="replied-message-content">
                          {replyData.media_url ? (
                            replyData.media_type.startsWith("image") ? (
                              <img src={replyData.media_url} alt="replied media" style={{ maxWidth: "100px", maxHeight: "100px" }} />
                            ) : replyData.media_type.startsWith("video") ? (
                              <video controls src={replyData.media_url} style={{ width: "120px", height: "80px" }} />
                            ) : replyData.media_type.startsWith("audio") ? (
                              <audio controls src={replyData.media_url} style={{ width: "150px" }} />
                            ) : null
                          ) : (
                            `"${replyData.message}"`
                          )}
                        </div>
                      </div>
                    )}
                    {msg.media_url && (
                      <div className="media-content" style={{ marginBottom: "8px" }}>
                        {msg.media_type && msg.media_type.startsWith("image") && (
                          <img src={msg.media_url} alt="sent media" style={{ maxWidth: "300px", maxHeight: "300px" }} />
                        )}
                        {msg.media_type && msg.media_type.startsWith("video") && (
                          <video controls src={msg.media_url} style={{ width: "300px", height: "200px" }} />
                        )}
                        {msg.media_type && msg.media_type.startsWith("audio") && (
                          <audio controls src={msg.media_url} style={{ width: "300px" }} />
                        )}
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
      {replyMessage && (
        <div className="reply-preview">
          <div>
            <b>
              Replying to @{replyMessage.user_id === user?.id ? "You" : replyMessage.profiles?.username || "Unknown"}:
            </b>{" "}
            {replyMessage.media_url ? (
              replyMessage.media_type.startsWith("image") ? (
                <img src={replyMessage.media_url} alt="replied media" style={{ maxWidth: "100px", maxHeight: "100px" }} />
              ) : replyMessage.media_type.startsWith("video") ? (
                <video controls src={replyMessage.media_url} style={{ width: "120px", height: "80px" }} />
              ) : replyMessage.media_type.startsWith("audio") ? (
                <audio controls src={replyMessage.media_url} style={{ width: "150px" }} />
              ) : null
            ) : (
              `"${(() => {
                let previewMsg = replyMessage.message;
                try {
                  const parsedReply = JSON.parse(replyMessage.message);
                  if (parsedReply && parsedReply.reply && parsedReply.message) {
                    previewMsg = parsedReply.message;
                  }
                } catch (e) {}
                return previewMsg;
              })()}"`
            )}
          </div>
          <button className="cancel-reply" onClick={() => setReplyMessage(null)}>
            X
          </button>
        </div>
      )}
      {mediaFile && (
        <div className="reply-preview">
          <div>
            <b>Media attached to message:</b> {mediaFile.name} ({(mediaFile.size / (1024 * 1024)).toFixed(2)}MB)
          </div>
          <button className="cancel-reply" onClick={() => setMediaFile(null)}>X</button>
        </div>
      )}
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
        <button type="button" onClick={() => mediaInputRef.current.click()} className="media-button" disabled={!!mediaFile}>
          <FiPaperclip size={28} color="white" />
        </button>
        <input
          type="file"
          ref={mediaInputRef}
          style={{ display: "none" }}
          accept="image/*,video/mp4,audio/mp3"
          onChange={handleMediaChange}
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Write message"
          className="chat-input"
        />
        <button className="send-button" onClick={handleSend}>
          Send
        </button>
        <button onClick={handleSchedulerClick} className="schedule-button">
          <MdScheduleSend size={30} color="FDFAF6" />
        </button>
        {showDatePicker && (
          <div className="modal">
            <h4>Pick date & time</h4>
            <input
              type="datetime-local"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="modal-input"
            />
            <div>
              <button className="modal-close" onClick={() => setShowDatePicker(false)}>
                Cancel
              </button>
              <button className="modal-button" onClick={handleSave}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          message={contextMenu.message}
          onClose={() => setContextMenu({ ...contextMenu, visible: false, message: null })}
          onReply={(msg) => setReplyMessage(msg)}
          role={role}
          teamOwnerId={teamOwnerId}
          user={user}
        />
      )}
    </div>
  );
};

export default ChannelDM;
