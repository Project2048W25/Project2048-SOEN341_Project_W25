import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import AdminView from "./AdminView";
import MemberView from "./MemberView";
import { supabase } from "../utils/supabaseClient";
import '../App.css'; // Import the Tailwind CSS file

export const Dashboard = ({ role }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        {role === "Admin" ? <AdminView /> : <MemberView />}
      </main>
    </div>
  );
};

export function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      console.log("Fetching user role...");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("User found:", user);
        let { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (!error) {
          console.log("User role:", data.role);
          setRole(data.role);
        } else {
          console.error("Error fetching user role:", error);
        }
      } else {
        console.log("No user found");
      }
      setLoading(false);
    };
    fetchUserRole();
  }, []);

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Redirect users if not logged in */}
        <Route
          path="/"
          element={role ? <Dashboard role={role} /> : <PlaceholderLogin />}
        />

        {/* If user is already logged in, prevent access to login */}
        <Route path="/login" element={role ? <Navigate to="/" /> : <PlaceholderLogin />} />

        {/* 404 Not Found page */}
        <Route path="*" element={<PlaceholderNotFound />} />
      </Routes>
    </Router>
  );
}

/* Placeholder Components */
const PlaceholderLogin = () => (
  <div className="flex items-center justify-center h-screen text-center">
    <h1 className="text-2xl font-bold">Login Page (To be implemented)</h1>
  </div>
);

const PlaceholderNotFound = () => (
  <div className="flex items-center justify-center h-screen text-center">
    <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
  </div>
);

export default App;
