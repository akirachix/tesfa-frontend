import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OrganizationsPage from "./page";
import useFetchOrganizations from "@/app/hooks/useFetchOrganizations";

jest.mock("@/app/hooks/useFetchOrganizations");

jest.mock("../sharedcomponent/Layout", () => {
  const LayoutMock: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
  LayoutMock.displayName = "LayoutMock";
  return LayoutMock;
});

jest.mock("next/image", () => ({
  __esModule: true,
  default: () => <div data-testid="mocked-next-image" />,
}));

const mockOrganizations = [
  {
    id: "1",
    org_name: "AkiraChix",
    logo_image: null,
    created_at: "2024-09-01T12:00:00.000Z",
    email: "akira@chix.org",
  },
  {
    id: "2",
    org_name: "Tesfa Org",
    logo_image: "/tesfa-logo.png",
    created_at: "2023-05-12T09:30:00.000Z",
    email: "info@tesfa.org",
  },
  {
    id: "3",
    org_name: "Another Org",
    logo_image: "https://example.com/logo.png",
    created_at: "2022-01-01T00:00:00.000Z",
    email: "another@org.com",
  },
];

describe("OrganizationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    (useFetchOrganizations as jest.Mock).mockReturnValue({ organizations: [], loading: true, error: null });
    render(<OrganizationsPage />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("renders error state", () => {
    (useFetchOrganizations as jest.Mock).mockReturnValue({ organizations: [], loading: false, error: "Fetch error" });
    render(<OrganizationsPage />);
    expect(screen.getByText(/Fetch error/i)).toBeInTheDocument();
  });

  it("renders 'Organization not found' when no organizations match search", () => {
    (useFetchOrganizations as jest.Mock).mockReturnValue({ organizations: mockOrganizations, loading: false, error: null });
    render(<OrganizationsPage />);
    fireEvent.change(screen.getByPlaceholderText(/search organizations by name/i), { target: { value: "xyz" } });
    expect(screen.getByText(/Organization not found/i)).toBeInTheDocument();
  });

  it("renders organizations and handles pagination", () => {
    const organizations = Array.from({ length: 13 }, (_, i) => ({
      id: i.toString(),
      org_name: `Org ${i + 1}`,
      logo_image: null,
      created_at: "2022-01-01T00:00:00.000Z",
      email: `email${i + 1}@org.com`,
    }));

    (useFetchOrganizations as jest.Mock).mockReturnValue({ organizations, loading: false, error: null });
    render(<OrganizationsPage />);
    expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
    expect(screen.getAllByText(/\?/)).toHaveLength(12);
    fireEvent.click(screen.getByText(/Next/i));
    expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();
    expect(screen.getAllByText(/\?/)).toHaveLength(1);
    fireEvent.click(screen.getByText(/Previous/i));
    expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
  });

  it("filters organizations by organization name", async () => {
    (useFetchOrganizations as jest.Mock).mockReturnValue({ organizations: mockOrganizations, loading: false, error: null });
    render(<OrganizationsPage />);
    fireEvent.change(screen.getByPlaceholderText(/search organizations by name/i), { target: { value: "akira" } });
    await waitFor(() => {
      expect(screen.getByText("AkiraChix")).toBeInTheDocument();
      expect(screen.queryByText("Tesfa Org")).not.toBeInTheDocument();
    });
  });

  it("shows fallback image when logo_image is missing", () => {
    (useFetchOrganizations as jest.Mock).mockReturnValue({ organizations: [mockOrganizations[0]], loading: false, error: null });
    render(<OrganizationsPage />);
    expect(screen.getByText(/\?/)).toBeInTheDocument();
  });

  it("formats date correctly", () => {
    (useFetchOrganizations as jest.Mock).mockReturnValue({ organizations: [mockOrganizations[1]], loading: false, error: null });
    render(<OrganizationsPage />);
    expect(screen.getByText("05/12/2023")).toBeInTheDocument();
  });
});
