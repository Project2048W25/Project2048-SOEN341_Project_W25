import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { Login } from "./Pages/Login";
import { Signup } from "./Pages/Signup";
import { ForgotPassword } from "./Pages/ForgotPassword";
import { AdminView } from "./Pages/AdminView";
import { AppChat } from "./Pages/App";
import { MemberView } from "./Pages/MemberView";
import { Sidebar } from "./Pages/Sidebar";
import { TeamAdminView } from "./Pages/TeamAdminView";
import MemberDM from "./Pages/MemberDM"; // Import MemberDM component

function Layout() {
  const location = useLocation();

  // Pages where Sidebar should be visible
  //"/app" , "/admin/:teamId""/admin", "/member", 
  const showSidebar = ["/dm/:username", "/dm"];

  return (
    <div className="app-container flex">
      {/* Show sidebar only if the path is in showSidebar list */}
      {showSidebar.some(path => location.pathname.startsWith(path)) && <Sidebar />}
      <div className="main-content flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/app" element={<AppChat />} />
          <Route path="/admin" element={<TeamAdminView />} />
          <Route path="/admin/:teamId" element={<AdminView />} />
          <Route path="/member" element={<MemberView />} />
          <Route path="/dm/:username" element={<MemberDM />} /> {/* Route for DM */}
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
        <link rel="stylesheet" href="styles/tailwind.CSS/tailwind.css" />
        <link rel="icon" type="image/x-icon" href={logo} />
      </head>

      <Router>
        <Layout />
      </Router>
    </>
  );
}

export default App;