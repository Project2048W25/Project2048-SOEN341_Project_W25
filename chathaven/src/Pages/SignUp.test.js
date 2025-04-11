import { render, screen } from "@testing-library/react";
import Signup from "./Signup";

describe("Signup Page Tests", () => {
  test("Signup page renders correctly", () => {
    render(<Signup />);
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
  });
});
