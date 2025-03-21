import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import Signup from "./Signup";  

describe("Signup Page Tests", () => {
  test("Signup page renders correctly", () => {
    render(<Signup />);
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });
});
