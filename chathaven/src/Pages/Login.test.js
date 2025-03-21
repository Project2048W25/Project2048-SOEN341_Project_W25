import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import Login from "./Login";  

describe("Login Page Tests", () => {
  test("Login page renders correctly", () => {
    render(<Login />);
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });
});
