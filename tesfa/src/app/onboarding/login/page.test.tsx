import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginPage from './page';
import { fetchLogin } from '../../../app/utils/loginUtils';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../app/utils/loginUtils', () => ({
  fetchLogin: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'>) => {
    const { src, alt = 'Mocked Image' } = props;
    return <img src={src} alt={alt} />;
  },
}));

const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');

afterEach(() => {
  jest.clearAllMocks();
  setItemSpy.mockClear();
  getItemSpy.mockClear();
});

describe('LoginPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('should render login form with all fields', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Welcome Back!/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('should toggle password visibility when eye icon is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText(/^Password$/i) as HTMLInputElement;
    expect(passwordInput).toHaveAttribute('type', 'password');

    const showPasswordBtn = screen.getByLabelText(/Show password/i);
    await user.click(showPasswordBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(showPasswordBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should submit form, save to localStorage, and redirect to /dashboard for regular user', async () => {
    const user = userEvent.setup();
    (fetchLogin as jest.Mock).mockResolvedValue({ token: 'fake-jwt-token-123', role: 'user' });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    expect(fetchLogin).toHaveBeenCalledWith({ email: 'user@example.com', password: 'password123' });
    expect(setItemSpy).toHaveBeenCalledWith('authToken', 'fake-jwt-token-123');
    expect(setItemSpy).toHaveBeenCalledWith('userRole', 'user');
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect to /admin/dashboard for admin user', async () => {
    const user = userEvent.setup();
    (fetchLogin as jest.Mock).mockResolvedValue({ token: 'admin-token-456', role: 'admin' });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'adminpass');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    expect(setItemSpy).toHaveBeenCalledWith('authToken', 'admin-token-456');
    expect(setItemSpy).toHaveBeenCalledWith('userRole', 'admin');
  });

  it('should disable button and show loading text during submission', async () => {
    const user = userEvent.setup();
    (fetchLogin as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ token: 't', role: 'user' }), 100))
    );

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^Password$/i), '123');

    const button = screen.getByRole('button', { name: /Sign in/i });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/Signing in.../i);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'));
  });

  it('should display error message if login fails', async () => {
    const user = userEvent.setup();
    (fetchLogin as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/i), 'bad@test.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});