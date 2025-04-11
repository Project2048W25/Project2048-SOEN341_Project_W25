import { render, screen } from "@testing-library/react";
//import OnlineStatus from "./OnlineStatus.jsx";

describe.skip("Online Presence Tests", () => {
  test("Online status component renders", () => {
    render(<OnlineStatus status="online" />);
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  test("Offline status is displayed correctly", () => {
    render(<OnlineStatus status="offline" />);
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });
});
