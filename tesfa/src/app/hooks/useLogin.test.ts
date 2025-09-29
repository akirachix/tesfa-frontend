import { renderHook, act } from '@testing-library/react';
import useLogin from './useLogin';
import { fetchLogin } from '../utils/loginUtils';

jest.mock('../utils/loginUtils', () => ({
  fetchLogin: jest.fn(),
}));

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return token and role on successful login', async () => {
    const mockResponse = { token: 'fake-token-123', role: 'user' };
    (fetchLogin as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin());

    let returnedData: { token: string; role: string } | null | undefined = undefined;
    await act(async () => {
      returnedData = await result.current.login({
        email: 'test@example.com',
        password: 'password',
      });
    });

    expect(returnedData).toEqual({ token: 'fake-token-123', role: 'user' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(localStorage.getItem('authToken')).toBe('fake-token-123');
    expect(localStorage.getItem('userRole')).toBe('user');
  });

  it('should set loading and error on failure', async () => {
    (fetchLogin as jest.Mock).mockRejectedValue(new Error('Login failed'));

    const { result } = renderHook(() => useLogin());

    let returnedData: { token: string; role: string } | null | undefined = undefined;
    await act(async () => {
      returnedData = await result.current.login({
        email: 'test@example.com',
        password: 'wrong',
      });
    });

    expect(returnedData).toBeNull();
    expect(result.current.error).toBe('Login failed');
    expect(result.current.loading).toBe(false);
  });
});
