import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "./index.css";

export const Sidebar = () => {
  // User & role state (including username for profile display)
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  // Teams & Channels
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [channels, setChannels] = useState([]);

  // Friends & friend requests
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  // Modals
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [showInviteTeamModal, setShowInviteTeamModal] = useState(false);
  const [teamToInvite, setTeamToInvite] = useState(null);
  const [inviteUsername, setInviteUsername] = useState("");

  const [showChannelModal, setShowChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [usernameToAdd, setUsernameToAdd] = useState("");

  // Add Friend Modal
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");

  const navigate = useNavigate();

  // Fetch user data, profile info, teams, friends, friend requests
  useEffect(() => {
    const fetchAllData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError);
        return;
      }
      setUser(user);
      if (!user) return;

      // Fetch profile info (username, role)
      const { data: profileData, error: profileFetchError } = await supabase
        .from("profiles")
        .select("username, role")
        .eq("id", user.id)
        .single();
      if (profileFetchError) {
        console.error("Error fetching profile:", profileFetchError);
        return;
      }
      if (profileData) {
        setRole(profileData.role);
        setUsername(profileData.username);
      }

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from("team_members")
        .select("team_id, teams(id, name, owner_id)")
        .eq("user_id", user.id);
      if (teamsError) {
        console.error("Error fetching teams:", teamsError);
      } else {
        setTeams(teamsData || []);
      }

      // Fetch accepted friends
      const { data: acceptedFriends, error: friendsError } = await supabase
        .from("friends")
        .select(
          "id, sender_id, receiver_id, sender:sender_id ( id, username ), receiver:receiver_id ( id, username )"
        )
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted")
        .order("created_at", { ascending: false });
      if (friendsError) {
        console.error("Error fetching friends:", friendsError);
      } else {
        setFriends(acceptedFriends || []);
      }

      // Fetch pending friend requests (where current user is receiver)
      const { data: pendingRequests, error: requestsError } = await supabase
        .from("friends")
        .select("id, sender_id, receiver_id, sender:sender_id ( id, username )")
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (requestsError) {
        console.error("Error fetching friend requests:", requestsError);
      } else {
        setFriendRequests(pendingRequests || []);
      }
    };

    fetchAllData();

    // Real-time subscriptions for friend updates
    const friendsSubscription = supabase
      .channel("friends_updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "friends" }, () => {
        fetchAllData();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "friends" }, () => {
        fetchAllData();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "friends" }, () => {
        fetchAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(friendsSubscription);
    };
  }, []);

  // Fetch channels when a team is selected
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

    // Real-time subscription for channel updates
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

  // Navigate to DM view for a friend
  const handleUserClick = (friend) => {
    const isSender = friend.sender_id === user?.id;
    const friendProfile = isSender ? friend.receiver : friend.sender;
    navigate(`/dm/${friendProfile.username}`);
  };

  // ==========================
  // Create Team
  // ==========================
  const createTeam = async () => {
    if (!newTeamName) return;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user for createTeam:", userError);
        return;
      }
      if (!user) return;

      const { data, error } = await supabase
        .from("teams")
        .insert([{ name: newTeamName, owner_id: user.id }])
        .select();
      if (error) {
        console.error("Error creating team:", error);
        return;
      }

      if (data && data.length > 0) {
        const newTeam = data[0];
        const { error: memberError } = await supabase
          .from("team_members")
          .insert([{ team_id: newTeam.id, user_id: user.id, invited_by: user.id }]);
        if (memberError) {
          console.error("Error adding self to new team:", memberError);
        }
      }
      setNewTeamName("");
      setShowTeamModal(false);
    } catch (err) {
      console.error("Error in createTeam:", err);
    }
  };

  // ==========================
  // Create Channel
  // ==========================
  const createChannel = async () => {
    if (!selectedTeam || !newChannelName) return;
    try {
      const { error: channelError } = await supabase
        .from("channels")
        .insert([{ title: newChannelName, team_id: selectedTeam.id }]);
      if (channelError) {
        console.error("Error creating channel:", channelError);
      } else {
        setNewChannelName("");
        setShowChannelModal(false);
      }
    } catch (err) {
      console.error("Error in createChannel:", err);
    }
  };

  // ==========================
  // Invite user to Team
  // ==========================
  const openInviteTeamModal = (team) => {
    setTeamToInvite(team);
    setInviteUsername("");
    setShowInviteTeamModal(true);
  };

  const inviteUserToTeam = async () => {
    if (!teamToInvite || !inviteUsername) return;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user for inviteUserToTeam:", userError);
        return;
      }
      if (!user) return;

      const { data: profileData, error: getProfileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", inviteUsername)
        .single();
      if (getProfileError) {
        alert("Error finding user: " + getProfileError.message);
        return;
      }
      if (!profileData) {
        alert("User not found.");
        return;
      }

      const userId = profileData.id;
      const { error: insertError } = await supabase
        .from("team_members")
        .insert([{ team_id: teamToInvite.id, user_id: userId, invited_by: user.id }]);
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

  // ==========================
  // Add user to Channel
  // ==========================
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
      if (userError) {
        alert("Error fetching user: " + userError.message);
        return;
      }
      if (!userData) {
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

  // ==========================
  // Send Friend Request
  // ==========================
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
      if (receiverError) {
        alert("Error finding user: " + receiverError.message);
        return;
      }
      if (!receiverData) {
        alert("User not found.");
        return;
      }
      const receiverId = receiverData.id;
      if (receiverId === user.id) {
        alert("You cannot add yourself as a friend.");
        return;
      }

      const { data: existingRequest, error: existingError } = await supabase
        .from("friends")
        .select("id, status")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("receiver_id", receiverId)
        .maybeSingle();
      if (existingError) {
        alert("Error checking existing friend request: " + existingError.message);
        return;
      }
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

  // ==========================
  // Accept / Decline Friend Request
  // ==========================
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

  // Helper: Check if current user is the team owner
  const userIsOwnerOf = (team) => {
    return team && team.owner_id === user?.id;
  };

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* Profile Showcase */}
      <div className="sidebar-profile">
        <div className="username">{username || "User"}</div>
        <div className="role">{role || "Member"}</div>
      </div>

      {/* Direct Messages Section */}
      <div className="section">
        <span className="sidebar-section-title">Direct Messages</span>
        <ul className="dm-list">
          {friends.map((f) => {
            const isSender = f.sender_id === user?.id;
            const friendProfile = isSender ? f.receiver : f.sender;
            return (
              <li key={f.id} className="dm-item" onClick={() => handleUserClick(f)}>
                {friendProfile?.username}
              </li>
            );
          })}
        </ul>
        <button className="add-friend-btn" onClick={() => setShowAddFriendModal(true)}>
          + Add Friend
        </button>
      </div>

      {/* Pending Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="section">
          <span className="sidebar-section-title">Pending Requests</span>
          <ul className="dm-list">
            {friendRequests.map((request) => (
              <li key={request.id} className="dm-item">
                <span>{request.sender?.username} (Pending)</span>
                <button onClick={() => acceptFriendRequest(request.id)}>✅</button>
                <button onClick={() => declineFriendRequest(request.id)}>❌</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Teams Section */}
      <div className="section">
        <span className="sidebar-section-title">Teams</span>
        <ul className="team-list">
          {teams.map(({ team_id, teams: teamData }) => {
            if (!teamData) return null;
            const canManageTeam = role === "Admin" && userIsOwnerOf(teamData);
            return (
              <li key={team_id} className="team-item" style={{ display: "flex", alignItems: "center" }}>
                <button style={{ flex: 1, marginRight: "6px" }} onClick={() => setSelectedTeam(teamData)}>
                  {teamData.name || "Unnamed Team"}
                </button>
                {canManageTeam && (
                  <button style={{ minWidth: "30px" }} onClick={() => openInviteTeamModal(teamData)}>
                    👤+
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {role === "Admin" && (
          <button className="create-team-btn" onClick={() => setShowTeamModal(true)}>
            Create Team
          </button>
        )}
      </div>

      {/* Channels Section */}
      {selectedTeam && (
        <div className="section">
          <div className="sidebar-section-title">
            {selectedTeam.name}
          </div>
          <ul className="channel-list">
            {channels.map((channel) => (
              <li
                key={channel.id}
                className="channel-item"
                onClick={() => navigate(`/channel/${channel.id}`)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span>{channel.title}</span>
                {role === "Admin" && userIsOwnerOf(selectedTeam) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigating to the channel
                      openAddUserModal(channel);
                    }}
                  >
                    👤+
                  </button>
                )}
              </li>
            ))}
          </ul>
          {selectedTeam && role === "Admin" && userIsOwnerOf(selectedTeam) && (
            <button className="create-channel-btn" onClick={() => setShowChannelModal(true)}>
              Create Channel
            </button>
          )}
        </div>
      )}

      {/* ============ MODALS ============ */}
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

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
