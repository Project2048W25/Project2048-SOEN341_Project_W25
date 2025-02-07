import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import "./index.css";

export const Sidebar = () => {
  const [teams, setTeams] = useState([]);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserAndTeams = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setUser(user);

      if (user) {
        // Fetch user role
        const { data: roleData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setRole(roleData?.role);

        // Fetch teams the user is a part of
        const { data: teamsData, error: teamsError } = await supabase
          .from("team_members")
          .select("team_id, teams(name)")
          .eq("user_id", user.id);

        if (teamsError) {
          console.error("Error fetching teams:", teamsError);
        } else {
          setTeams(teamsData || []);
        }
      }
    };

    fetchUserAndTeams();

    // Real-time Subscription for Team Updates
    const teamSubscription = supabase
      .channel('team_updates')
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "team_members" },
        fetchUserAndTeams // Refresh when a user is added to a team
      )
      .subscribe();

    return () => {
      supabase.removeChannel(teamSubscription);
    };
  }, []);

  return (
    <aside className="sidebar">
      <div className="title">ChatHaven</div>

      <div className="section">
        <div className="font-semibold">{user ? user.email : "Loading..."}</div>
      </div>

      <div className="section">
        <div>Teams</div>

        {/* Remove the "+" button for Members */}
        {role === "Admin" && (
          <button>+</button> // Only show for Admins
        )}

        <ul>
          {teams.map((team, index) => (
            <li key={index} className="text-sm mt-2">
              <button className="team-button">{team.teams?.name || "Unnamed Team"}</button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
