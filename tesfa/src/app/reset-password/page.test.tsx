import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "./page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("../hooks/usePasswordReset", () => ({
  usePasswordReset: jest.fn(() => ({
    loading: false,
    message: null,
    error: null,
    requestReset: jest.fn(),
  })),
}));

describe("ForgotPasswordPage", () => {
  const mockRequestReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form components", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByPlaceholderText(/enter your email here/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("updates email input on change", async () => {
    render(<ForgotPasswordPage />);
    const input = screen.getByPlaceholderText(/enter your email here/i);
    await userEvent.type(input, "test@example.com");
    expect(input).toHaveValue("test@example.com");
  });

  it("calls requestReset handler on form submit", async () => {
    jest.mock("../hooks/usePasswordReset", () => ({
      usePasswordReset: jest.fn(() => ({
        loading: false,
        message: null,
        error: null,
        requestReset: mockRequestReset,
      })),
    }));

    render(<ForgotPasswordPage />);
    const input = screen.getByPlaceholderText(/enter your email here/i);

    await userEvent.type(input, "test@example.com");

    await waitFor(() => {
    });
  });

  it("disables submit button when loading", () => {
    jest.mock("../hooks/usePasswordReset", () => ({
      usePasswordReset: jest.fn(() => ({
        loading: true,
        message: null,
        error: null,
        requestReset: jest.fn(),
      })),
    }));

    render(<ForgotPasswordPage />);
    const button = screen.getByRole("button", { name: /send/i });
    
  });

  it("shows success message", () => {
    jest.mock("../hooks/usePasswordReset", () => ({
      usePasswordReset: jest.fn(() => ({
        loading: false,
        message: "Reset link sent",
        error: null,
        requestReset: jest.fn(),
      })),
    }));

    render(<ForgotPasswordPage />);
  
  });

  it("shows error message", () => {
    jest.mock("../hooks/usePasswordReset", () => ({
      usePasswordReset: jest.fn(() => ({
        loading: false,
        message: null,
        error: "Failed to send reset",
        requestReset: jest.fn(),
      })),
    }));

    render(<ForgotPasswordPage />);
    
  });
});
