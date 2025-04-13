import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Sidebar } from "./Sidebar";
import { AdminView } from "./AdminView";
import { MemberView } from "./MemberView";
import "../styles/index.css";

export const AppChat = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        setLoading(false);
        return;
      }
      if (user) {
        // Fetch role from "profiles"
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!error && profileData) {
          setRole(profileData.role);
        } else {
          console.error("Error fetching user role:", error);
        }
      }
      setLoading(false);
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        {role === "Admin" ? <AdminView /> : <MemberView />}
      </main>
    </div>
  );
};
