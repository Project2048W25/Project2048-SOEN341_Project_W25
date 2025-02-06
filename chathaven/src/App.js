import logo from './logo.svg';
import {Routes, Route, BrowserRouter, useInRouterContext} from 'react-router-dom';
import { useLocation } from "react-router-dom";
import './App.css';
import {Login} from "./Pages/Login";
import {Dashboard} from "./Pages/Dashboard";
import {Signup} from "./Pages/Signup";
import {Forgot} from "./Pages/Forgot";

    function App() {
      return (
      <>
          <head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <title>{'ChatHaven'}</title>
            <link rel="stylesheet" href="styles.css"/>
            <link rel="icon" type="image/x-icon" href= {logo} />
            </head>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/forgot" element={<Forgot/>}/>
        </Routes>
</BrowserRouter>
</>
)
  ;
}

export default App;
