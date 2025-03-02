import logo from './logo.svg';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import './App.css';
import { Login } from "./Pages/Login";
import { Signup } from "./Pages/Signup";
import { ForgotPassword } from "./Pages/ForgotPassword";
import { AdminView } from "./Pages/AdminView";
import { AppChat } from "./Pages/App";
import { MemberView } from "./Pages/MemberView";
import { Sidebar } from "./Pages/Sidebar";
import GoogleCallback from "./components/GoogleCallback";
import { TeamAdminView } from "./Pages/TeamAdminView";

function App() {
  return (
    <>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{'ChatHaven'}</title>
        <link rel="stylesheet" href="styles/tailwind.CSS/tailwind.css" />
        <link rel="icon" type="image/x-icon" href={logo} />
      </head>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/app" element={<AppChat />} />
          <Route path="/google-callback" element={<GoogleCallback />} />
          <Route path="/admin" element={<TeamAdminView  />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
