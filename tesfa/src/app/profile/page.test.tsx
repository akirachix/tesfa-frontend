import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "./page";
import useFetchOrganization from "@/app/hooks/useFetchOrganization";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock("@/app/hooks/useFetchOrganization");

process.env.API_URL = "http://localhost:3000";

describe("ProfilePage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state", () => {
    (useFetchOrganization as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      error: null,
    });
    render(<ProfilePage />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("shows error state", () => {
    (useFetchOrganization as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: "Failed to load profile",
    });
    render(<ProfilePage />);
    expect(screen.getByText(/Failed to load profile/i)).toBeInTheDocument();
  });

  it("renders profile data correctly", async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    (useFetchOrganization as jest.Mock).mockReturnValue({
      user: {
        org_name: "Hope NGO",
        email: "hope@ngo.org",
        created_at: "2024-01-15T10:30:00Z",
        logo_image: "/logos/hope.png",
      },
      loading: false,
      error: null,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Hope NGO")).toBeInTheDocument();
    });

    expect(screen.getByText("hope@ngo.org")).toBeInTheDocument();
    expect(screen.getByText("Jan 15, 2024")).toBeInTheDocument();

    const editButton = screen.getByLabelText("Edit Profile");
    expect(editButton).toBeInTheDocument();
  });

  it("handles absolute logo URL", async () => {
    (useFetchOrganization as jest.Mock).mockReturnValue({
      user: {
        org_name: "Global Aid",
        email: "contact@globalaid.org",
        created_at: "2023-05-20T08:00:00Z",
        logo_image: "https://example.com/logo.png",
      },
      loading: false,
      error: null,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Global Aid")).toBeInTheDocument();
    });
  });

  it("navigates to /edit-profile when edit button is clicked", async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    (useFetchOrganization as jest.Mock).mockReturnValue({
      user: {
        org_name: "Hope NGO",
        email: "hope@ngo.org",
        created_at: "2024-01-15T10:30:00Z",
        logo_image: "/logos/hope.png",
      },
      loading: false,
      error: null,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Hope NGO")).toBeInTheDocument();
    });

    const editButton = screen.getByLabelText("Edit Profile");
    await user.click(editButton);

    expect(mockPush).toHaveBeenCalledWith("/edit-profile");
  });

  it("handles missing or empty logo gracefully", async () => {
    (useFetchOrganization as jest.Mock).mockReturnValue({
      user: {
        org_name: "No Logo Org",
        email: "no@logo.org",
        created_at: "2024-01-15T10:30:00Z",
        logo_image: "",
      },
      loading: false,
      error: null,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("No Logo Org")).toBeInTheDocument();
    });

    const logos = screen.queryAllByAltText("Organization Logo");
    expect(logos.length).toBe(0);
  });

  it("formats date correctly with invalid/missing date", async () => {
    (useFetchOrganization as jest.Mock).mockReturnValue({
      user: {
        org_name: "Date Test Org",
        email: "date@test.org",
        created_at: null,
        logo_image: null,
      },
      loading: false,
      error: null,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Date Test Org")).toBeInTheDocument();
    });

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });
});
