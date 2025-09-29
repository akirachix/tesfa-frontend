import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import ResetFormClient from ".";
import { useRouter } from "next/navigation";
import usePasswordResetConfirm from "@/app/hooks/usePasswordConfirm";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/app/hooks/usePasswordConfirm", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("ResetFormClient", () => {
  const defaultProps = { uid: "abc123", token: "xyz789" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form and inputs", () => {
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push: jest.fn() });
    (usePasswordResetConfirm as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      message: null,
      confirmReset: jest.fn().mockResolvedValue({}),
      setError: jest.fn(),
    });

    render(<ResetFormClient {...defaultProps} />);

    expect(screen.getByPlaceholderText("New Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm New Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  });

  it("shows error on password < 8 chars", async () => {
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push: jest.fn() });
    (usePasswordResetConfirm as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      message: null,
      confirmReset: jest.fn(),
      setError: jest.fn(),
    });

    render(<ResetFormClient {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("New Password"), { target: { value: "123" } });

    expect(await screen.findByText("Must be at least 8 characters")).toBeInTheDocument();
  });

  it("shows error if passwords do not match", async () => {
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push: jest.fn() });
    (usePasswordResetConfirm as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      message: null,
      confirmReset: jest.fn(),
      setError: jest.fn(),
    });

    render(<ResetFormClient {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("New Password"), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm New Password"), { target: { value: "password321" } });

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
  });

  it("calls confirmReset and redirects on submit", async () => {
    const mockPush = jest.fn();
    const mockConfirmReset = jest.fn().mockResolvedValue({});

    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push: mockPush });
    (usePasswordResetConfirm as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      message: "Success",
      confirmReset: mockConfirmReset,
      setError: jest.fn(),
    });

    render(<ResetFormClient {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("New Password"), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm New Password"), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/resetsuccess"));
  });

  it("disables submit button when loading", () => {
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push: jest.fn() });
    (usePasswordResetConfirm as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
      message: null,
      confirmReset: jest.fn(),
      setError: jest.fn(),
    });

    render(<ResetFormClient {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Resetting..." })).toBeDisabled();
  });

  it("displays error message when API call fails", async () => {
    const errorMessage = "API Error";
    const mockSetError = jest.fn();
    const mockConfirmReset = jest.fn().mockRejectedValue(new Error(errorMessage));

    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push: jest.fn() });
    (usePasswordResetConfirm as jest.Mock).mockReturnValue({
      loading: false,
      error: errorMessage,
      message: null,
      confirmReset: mockConfirmReset,
      setError: mockSetError,
    });

    render(<ResetFormClient {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("New Password"), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm New Password"), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockConfirmReset).toHaveBeenCalled();
      expect(mockSetError).toHaveBeenCalledWith(errorMessage);
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push: jest.fn() });
    (usePasswordResetConfirm as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      message: null,
      confirmReset: jest.fn(),
      setError: jest.fn(),
    });

    render(<ResetFormClient {...defaultProps} />);
    const passwordInput = screen.getByPlaceholderText("New Password");
    const toggleBtn = screen.getByTestId("toggle-password-visibility");

    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("toggles confirm password visibility", () => {
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push: jest.fn() });
    (usePasswordResetConfirm as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      message: null,
      confirmReset: jest.fn(),
      setError: jest.fn(),
    });

    render(<ResetFormClient {...defaultProps} />);
    const confirmInput = screen.getByPlaceholderText("Confirm New Password");
    const toggleBtn = screen.getByTestId("toggle-confirm-password-visibility");

    expect(confirmInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleBtn);
    expect(confirmInput).toHaveAttribute("type", "text");
    fireEvent.click(toggleBtn);
    expect(confirmInput).toHaveAttribute("type", "password");
  });

  it("calls router.back() on back button click", () => {
    const mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
    (usePasswordResetConfirm as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      message: null,
      confirmReset: jest.fn(),
      setError: jest.fn(),
    });

    render(<ResetFormClient {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Go back"));
    expect(mockBack).toHaveBeenCalled();
  });
});
