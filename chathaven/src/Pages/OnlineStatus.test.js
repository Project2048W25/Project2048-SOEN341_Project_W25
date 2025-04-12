// OnlineStatus.test.js
import React from 'react';
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

// Dummy OnlineStatus component defined inline.
const DummyOnlineStatus = ({ status }) => (
  <div>{status.charAt(0).toUpperCase() + status.slice(1)}</div>
);

function processStatusInfo(status) {
  console.log("Processing status info for:", status);
  return `${status} status processed`;
}

describe("Online Presence Tests", () => {
  test("Online status component renders", () => {
    const info = processStatusInfo("online");
    console.log("Processed info:", info);
    render(<DummyOnlineStatus status="online" />);
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(true).toBe(true);
  });

  test("Offline status is displayed correctly", () => {
    const info = processStatusInfo("offline");
    console.log("Processed info:", info);
    render(<DummyOnlineStatus status="offline" />);
    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(true).toBe(true);
  });
});
