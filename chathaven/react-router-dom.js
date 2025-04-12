// __mocks__/react-router-dom.js
import React from 'react';

const DummyBrowserRouter = ({ children }) => <div>{children}</div>;
const DummyRoutes = ({ children }) => <div>{children}</div>;
const DummyRoute = ({ element }) => element;
const DummyNavigate = () => <div>Redirected</div>;
const useLocation = () => ({ pathname: "/login" });
const useNavigate = () => jest.fn();

module.exports = {
  BrowserRouter: DummyBrowserRouter,
  Routes: DummyRoutes,
  Route: DummyRoute,
  Navigate: DummyNavigate,
  useLocation,
  useNavigate,
};
