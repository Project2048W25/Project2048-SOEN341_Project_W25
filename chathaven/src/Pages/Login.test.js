import { render, screen } from "@testing-library/react";
import Login from "./Login";

describe("Login Page Tests", () => {
  test("Login page renders correctly", () => {
    render(<Login />);
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });
});
