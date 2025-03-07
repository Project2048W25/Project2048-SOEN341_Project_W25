import logo from './logo.svg';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './utils/supabaseClient';

import './index.css';
import { Login } from "./Pages/Login";
import { Signup } from "./Pages/Signup";
import { ForgotPassword } from "./Pages/ForgotPassword";
import { AdminView } from "./Pages/AdminView";
import { AppChat } from "./Pages/App";
import { MemberView } from "./Pages/MemberView";
import { Sidebar } from "./Pages/Sidebar";
import { TeamAdminView } from "./Pages/TeamAdminView";
import MemberDM from "./Pages/MemberDM";
import ChannelDM from "./Pages/ChannelDM";
import GoogleCallback from './Pages/GoogleCallback';

function Layout() {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session);
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session);
      setSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Wait until session check is complete
  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  // Define unprotected routes
  const unprotectedRoutes = ["/login", "/signup", "/forgot"];
  const isUnprotected = unprotectedRoutes.includes(location.pathname);

  // If no session and route is protected, redirect to login
  if (!session && !isUnprotected) {
    console.log("No session detected; redirecting to /login");
    return <Navigate to="/login" />;
  }

  // Show the sidebar on certain routes
  const showSidebar = ["/dm", "/channel", "/app", "/admin", "/member"];
  const shouldShowSidebar = showSidebar.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="app-container flex">
      {shouldShowSidebar && <Sidebar />}
      <div className="main-content flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/google-callback" element={<GoogleCallback />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/app" element={<AppChat />} />
          <Route path="/admin" element={<TeamAdminView />} />
          <Route path="/admin/:teamId" element={<AdminView />} />
          <Route path="/member" element={<MemberView />} />
          <Route path="/dm/:username" element={<MemberDM />} />
          <Route path="/channel/:channelId" element={<ChannelDM />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{'ChatHaven'}</title>
        <link rel="icon" type="image/x-icon" href={logo} />
      </head>
      <Router>
        <Layout />
      </Router>
    </>
  );
}

export default App;
