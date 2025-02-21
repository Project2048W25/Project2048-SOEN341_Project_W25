import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import "./index.css";

export const Sidebar = () => {
  // User & role state
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // Teams & Channels
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [channels, setChannels] = useState([]);

  // Team creation/invite modals
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [showInviteTeamModal, setShowInviteTeamModal] = useState(false);
  const [teamToInvite, setTeamToInvite] = useState(null);
  const [inviteUsername, setInviteUsername] = useState("");

  // Channel creation/invite modals
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [usernameToAdd, setUsernameToAdd] = useState("");

  // Friends & friend requests
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");

  // Function to fetch all required data
  const fetchAllData = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
      return;
    }
    setUser(user);
    if (!user) return;

    // Fetch user role
    const { data: roleData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (roleData) setRole(roleData.role);

    // Fetch teams (via team_members join)
    const { data: teamsData } = await supabase
      .from("team_members")
      .select("team_id, teams(id, name, owner_id)")
      .eq("user_id", user.id);
    setTeams(teamsData || []);

    // Fetch accepted friends using aliased relationships
    const { data: acceptedFriends } = await supabase
      .from("friends")
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:sender_id ( id, username ),
        receiver:receiver_id ( id, username )
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq("status", "accepted")
      .order("created_at", { ascending: false });
    setFriends(acceptedFriends || []);

    // Fetch pending friend requests (where current user is the receiver)
    const { data: pendingRequests } = await supabase
      .from("friends")
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:sender_id ( id, username ),
        receiver:receiver_id ( id, username )
      `)
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setFriendRequests(pendingRequests || []);
  };

  // Initial fetch and real-time subscriptions for friends
  useEffect(() => {
    fetchAllData();

    const friendsSubscription = supabase
      .channel("friends_updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "friends" }, (payload) => {
        console.log("Friend INSERT event received:", payload);
        fetchAllData();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "friends" }, (payload) => {
        console.log("Friend UPDATE event received:", payload);
        fetchAllData();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "friends" }, (payload) => {
        console.log("Friend DELETE event received:", payload);
        fetchAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(friendsSubscription);
    };
  }, []);

  // Friend Request Handlers
  const sendFriendRequest = async () => {
    if (!friendUsername) {
      alert("Please enter a username.");
      return;
    }
    try {
      const { data: receiverData, error: receiverError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", friendUsername)
        .single();
      if (receiverError || !receiverData) {
        alert("User not found.");
        return;
      }
      const receiverId = receiverData.id;
      if (receiverId === user.id) {
        alert("You cannot add yourself as a friend.");
        return;
      }
      const { data: existingRequest } = await supabase
        .from("friends")
        .select("id, status")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("receiver_id", receiverId)
        .maybeSingle();
      if (existingRequest) {
        if (existingRequest.status === "pending") {
          alert("Friend request already sent.");
          return;
        } else if (existingRequest.status === "accepted") {
          alert("You are already friends.");
          return;
        }
      }
      const { error: insertError } = await supabase
        .from("friends")
        .insert([{ sender_id: user.id, receiver_id: receiverId, status: "pending" }]);
      if (insertError) {
        alert("Error sending friend request: " + insertError.message);
        return;
      }
      alert("Friend request sent!");
      setFriendUsername("");
      setShowAddFriendModal(false);
    } catch (err) {
      console.error("Error sending friend request:", err);
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("id", requestId);
      alert("Friend request accepted!");
    } catch (err) {
      console.error("Error accepting friend request:", err);
    }
  };

  const declineFriendRequest = async (requestId) => {
    try {
      await supabase.from("friends").delete().eq("id", requestId);
      alert("Friend request declined!");
    } catch (err) {
      console.error("Error declining friend request:", err);
    }
  };

  // Teams Subscription
  useEffect(() => {
    const fetchTeams = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: teamsData } = await supabase
        .from("team_members")
        .select("team_id, teams(id, name, owner_id)")
        .eq("user_id", user.id);
      setTeams(teamsData || []);
    };
    fetchTeams();
    const teamSubscription = supabase
      .channel("team_updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "team_members" }, fetchTeams)
      .subscribe();
    return () => {
      supabase.removeChannel(teamSubscription);
    };
  }, []);

  // Channels Subscription
  useEffect(() => {
    if (!selectedTeam) {
      setChannels([]);
      return;
    }
    const fetchChannels = async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("team_id", selectedTeam.id);
      if (error) {
        console.error("Error fetching channels:", error);
      } else {
        setChannels(data || []);
      }
    };
    fetchChannels();
    const channelSubscription = supabase
      .channel("channel_updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "channels" }, (payload) => {
        if (payload.new.team_id === selectedTeam.id) {
          fetchChannels();
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channelSubscription);
    };
  }, [selectedTeam]);

  // Team & Channel Creation
  const createTeam = async () => {
    if (!newTeamName) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("teams")
        .insert([{ name: newTeamName, owner_id: user.id }])
        .select();
      if (error) throw error;
      if (data && data.length > 0) {
        const newTeam = data[0];
        await supabase.from("team_members").insert([
          { team_id: newTeam.id, user_id: user.id, invited_by: user.id },
        ]);
      }
      setNewTeamName("");
      setShowTeamModal(false);
    } catch (err) {
      console.error("Error creating team:", err);
    }
  };

  const createChannel = async () => {
    if (!selectedTeam || !newChannelName) return;
    const { data, error } = await supabase
      .from("channels")
      .insert([{ title: newChannelName, team_id: selectedTeam.id }]);
    if (error) {
      console.error("Error creating channel:", error);
    } else {
      setNewChannelName("");
      setShowChannelModal(false);
    }
  };

  // Team Invite
  const openInviteTeamModal = (team) => {
    setTeamToInvite(team);
    setInviteUsername("");
    setShowInviteTeamModal(true);
  };

  const inviteUserToTeam = async () => {
    if (!teamToInvite || !inviteUsername) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", inviteUsername)
        .single();
      if (profileError || !profileData) {
        alert("User not found.");
        return;
      }
      const userId = profileData.id;
      const { error: insertError } = await supabase.from("team_members").insert([
        { team_id: teamToInvite.id, user_id: userId, invited_by: user.id },
      ]);
      if (insertError) {
        alert("Error inviting user: " + insertError.message);
        return;
      }
      alert("User invited to the team!");
      setShowInviteTeamModal(false);
      setInviteUsername("");
      setTeamToInvite(null);
    } catch (err) {
      console.error("Error inviting user to team:", err);
    }
  };

  // Channel Invite
  const openAddUserModal = (channel) => {
    setSelectedChannel(channel);
    setUsernameToAdd("");
    setShowAddUserModal(true);
  };

  const addUserToChannel = async () => {
    if (!usernameToAdd || !selectedChannel || !selectedTeam) return;
    try {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", usernameToAdd)
        .single();
      if (userError || !userData) {
        alert("No user found with that username");
        return;
      }
      const userId = userData.id;
      const { data: membershipData, error: membershipError } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", selectedTeam.id)
        .eq("user_id", userId)
        .maybeSingle();
      if (membershipError) {
        alert("Error checking membership: " + membershipError.message);
        return;
      }
      if (!membershipData) {
        alert("That user is not in this team. Invite them first.");
        return;
      }
      const { error: insertError } = await supabase
        .from("channel_members")
        .insert([{ channel_id: selectedChannel.id, user_id: userId }]);
      if (insertError) {
        alert("Error adding user to channel: " + insertError.message);
        return;
      }
      alert("User added to channel!");
      setShowAddUserModal(false);
      setUsernameToAdd("");
      setSelectedChannel(null);
    } catch (err) {
      console.error("Error adding user to channel:", err);
    }
  };

  // Helper: check if current user is the team owner
  const userIsOwnerOf = (team) => {
    return team && team.owner_id === user?.id;
  };

  return (
    <aside className="sidebar">
      <div className="title">ChatHaven</div>

      {/* FRIENDS SECTION */}
      <div className="section">
        <span>Friends</span>
        <button
          className="add-user-btn"
          onClick={() => {
            console.log("Add Friend button clicked");
            setShowAddFriendModal(true);
          }}
        >
          👤+
        </button>
        <ul>
          {friends.map((f) => {
            const isSender = f.sender_id === user?.id;
            const friendProfile = isSender ? f.receiver : f.sender;
            return (
              <li key={f.id} className="friend-item">
                <span>{friendProfile?.username}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* PENDING FRIEND REQUESTS */}
      {friendRequests.length > 0 && (
        <div className="section">
          <span>Pending Requests</span>
          <ul>
            {friendRequests.map((request) => (
              <li key={request.id} className="friend-item">
                <span>{request.sender?.username} (Pending)</span>
                <button className="accept-btn" onClick={() => acceptFriendRequest(request.id)}>
                  ✅
                </button>
                <button className="decline-btn" onClick={() => declineFriendRequest(request.id)}>
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TEAMS SECTION */}
      <div className="section">
        <span>
          Teams
          {role === "Admin" && (
            <button className="add-user-btn" onClick={() => setShowTeamModal(true)}>
              🌐+
            </button>
          )}
        </span>
        <ul>
          {teams.map(({ team_id, teams: teamData }) => {
            if (!teamData) return null;
            const canManageTeam = role === "Admin" && userIsOwnerOf(teamData);
            return (
              <li key={team_id} className="team-item" style={{ display: "flex", alignItems: "center" }}>
                <button className="team-button" style={{ flex: 1, marginRight: "6px" }} onClick={() => setSelectedTeam(teamData)}>
                  {teamData.name || "Unnamed Team"}
                </button>
                {canManageTeam && (
                  <button className="add-user-btn" style={{ minWidth: "30px" }} onClick={() => openInviteTeamModal(teamData)}>
                    👤+
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* CHANNELS SECTION */}
      {selectedTeam && (
        <div className="channels-sidebar">
          <div className="channels-header">
            <h3>{selectedTeam.name}</h3>
            {role === "Admin" && userIsOwnerOf(selectedTeam) && (
              <button className="add-channel-btn" onClick={() => setShowChannelModal(true)}>
                + Channel
              </button>
            )}
          </div>
          <ul className="channels-list">
            {channels.map((channel) => (
              <li key={channel.id} className="channel-item">
                <span>{channel.title}</span>
                {role === "Admin" && userIsOwnerOf(selectedTeam) && (
                  <button className="add-user-btn" onClick={() => openAddUserModal(channel)}>
                    👤+
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* =================== MODALS =================== */}

      {/* Create Team Modal */}
      {showTeamModal && (
        <div className="modal">
          <h4>Create a New Team</h4>
          <input
            type="text"
            placeholder="Enter team name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="modal-input"
          />
          <button className="modal-button" onClick={createTeam}>
            Create
          </button>
          <button className="modal-close" onClick={() => setShowTeamModal(false)}>
            Close
          </button>
        </div>
      )}

      {/* Invite to Team Modal */}
      {showInviteTeamModal && (
        <div className="modal">
          <h4>Invite user to {teamToInvite?.name}</h4>
          <input
            type="text"
            placeholder="Username"
            value={inviteUsername}
            onChange={(e) => setInviteUsername(e.target.value)}
            className="modal-input"
          />
          <button className="modal-button" onClick={inviteUserToTeam}>
            Invite
          </button>
          <button className="modal-close" onClick={() => { setShowInviteTeamModal(false); setTeamToInvite(null); }}>
            Close
          </button>
        </div>
      )}

      {/* Create Channel Modal */}
      {showChannelModal && (
        <div className="modal">
          <h4>Create a New Channel</h4>
          <input
            type="text"
            placeholder="Enter channel name"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            className="modal-input"
          />
          <button className="modal-button" onClick={createChannel}>
            Create
          </button>
          <button className="modal-close" onClick={() => setShowChannelModal(false)}>
            Close
          </button>
        </div>
      )}

      {/* Add User to Channel Modal */}
      {showAddUserModal && (
        <div className="modal">
          <h4>Add user to {selectedChannel?.title}</h4>
          <input
            type="text"
            placeholder="Enter username"
            value={usernameToAdd}
            onChange={(e) => setUsernameToAdd(e.target.value)}
            className="modal-input"
          />
          <button className="modal-button" onClick={addUserToChannel}>
            Add
          </button>
          <button className="modal-close" onClick={() => setShowAddUserModal(false)}>
            Close
          </button>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="modal">
          <h4>Add a Friend</h4>
          <input
            type="text"
            placeholder="Enter friend's username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            className="modal-input"
          />
          <button className="modal-button" onClick={sendFriendRequest}>
            Send Request
          </button>
          <button className="modal-close" onClick={() => setShowAddFriendModal(false)}>
            Close
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
