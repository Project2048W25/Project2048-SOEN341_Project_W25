import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import "./index.css";

export const Sidebar = () => {
  const [friends, setFriends] = useState([]);
  const [teams, setTeams] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setUser(user);

      if (user) {
        const { data: friendsData } = await supabase
          .from("friends")
          .select("name")
          .eq("user_id", user.id);

        const { data: teamsData } = await supabase
          .from("teams")
          .select("name")
          .contains("members", [user.id]);

        setFriends(friendsData || []);
        setTeams(teamsData || []);
      }
    };

    fetchData();
  }, []);

  return (
    <aside className="sidebar">
      <div className="title">ChatHaven</div>
      
      <div className="section">
        <div className="font-semibold">{user ? user.email : "Loading..."}</div>
      </div>

      <div className="section">
        <div>Direct Messages</div>
        <button>+</button>
        <ul>
          {friends.map((friend, index) => (
            <li key={index} className="text-sm mt-2">{friend.name}</li>
          ))}
        </ul>
      </div>

      <div className="section">
        <div>Teams</div>
        <button>+</button>
        <ul>
          {teams.map((team, index) => (
            <li key={index} className="text-sm mt-2">{team.name}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
