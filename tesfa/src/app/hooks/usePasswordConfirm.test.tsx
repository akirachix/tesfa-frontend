import { renderHook, act } from '@testing-library/react';
import usePasswordResetConfirm from './usePasswordConfirm';
import { fetchPasswordResetConfirm } from '../utils/fetchPasswordResetConfirm';

jest.mock('../utils/fetchPasswordResetConfirm', () => ({
  fetchPasswordResetConfirm: jest.fn(),
}));

type ResetPayload = {
  uidb64: string;
  token: string;
  new_password: string;
  confirm_password: string;
};

describe('usePasswordResetConfirm', () => {
  const mockFetch = fetchPasswordResetConfirm as jest.MockedFunction<
    typeof fetchPasswordResetConfirm
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => usePasswordResetConfirm());

    expect(result.current.loading).toBe(false);
    expect(result.current.message).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets loading to true during request and false after', async () => {
    mockFetch.mockResolvedValue({ message: 'Password reset successful' });

    const { result } = renderHook(() => usePasswordResetConfirm());

    const payload: ResetPayload = {
      uidb64: 'abc123',
      token: 'xyz789',
      new_password: 'newPass123!',
      confirm_password: 'newPass123!',
    };

    await act(async () => {
      await result.current.confirmReset(payload);
    });

    expect(result.current.loading).toBe(false);
  });

  it('sets message on successful password reset', async () => {
    const successMessage = 'Password has been reset successfully';
    mockFetch.mockResolvedValue({ message: successMessage });

    const { result } = renderHook(() => usePasswordResetConfirm());

    const payload: ResetPayload = {
      uidb64: 'abc123',
      token: 'xyz789',
      new_password: 'newPass123!',
      confirm_password: 'newPass123!',
    };

    await act(async () => {
      await result.current.confirmReset(payload);
    });

    expect(result.current.message).toBe(successMessage);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failed password reset', async () => {
    const errorMessage = 'Invalid token';
    mockFetch.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePasswordResetConfirm());

    const payload: ResetPayload = {
      uidb64: 'abc123',
      token: 'xyz789',
      new_password: 'newPass123!',
      confirm_password: 'newPass123!',
    };

    await act(async () => {
      try {
        await result.current.confirmReset(payload);
      } catch {
      }
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.message).toBeNull();
  });

  it('resets message and error before each request', async () => {
    mockFetch.mockResolvedValueOnce({ message: 'First success' });
    mockFetch.mockResolvedValueOnce({ message: 'Second success' });

    const { result } = renderHook(() => usePasswordResetConfirm());

    const payload1: ResetPayload = {
      uidb64: 'abc123',
      token: 'xyz789',
      new_password: 'pass1',
      confirm_password: 'pass1',
    };

    await act(async () => {
      await result.current.confirmReset(payload1);
    });

    expect(result.current.message).toBe('First success');

    const payload2: ResetPayload = {
      uidb64: 'def456',
      token: 'uvw012',
      new_password: 'pass2',
      confirm_password: 'pass2',
    };

    await act(async () => {
      await result.current.confirmReset(payload2);
    });

    expect(result.current.message).toBe('Second success');
  });

  it('returns response object on success', async () => {
    const mockResponse = { message: 'Success', status: 'ok' };
    mockFetch.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePasswordResetConfirm());

    const payload: ResetPayload = {
      uidb64: 'abc123',
      token: 'xyz789',
      new_password: 'newPass123!',
      confirm_password: 'newPass123!',
    };

    let returnedValue: unknown;

    await act(async () => {
      returnedValue = await result.current.confirmReset(payload);
    });

    expect(returnedValue).toEqual(mockResponse);
  });

  it('re-throws error after setting error state', async () => {
    const errorMessage = 'Token expired';
    mockFetch.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePasswordResetConfirm());

    const payload: ResetPayload = {
      uidb64: 'abc123',
      token: 'xyz789',
      new_password: 'newPass123!',
      confirm_password: 'newPass123!',
    };

    let caughtError: Error | null = null;

    await act(async () => {
      try {
        await result.current.confirmReset(payload);
      } catch (err) {
        caughtError = err as Error;
      }
    });
    expect(caughtError).toEqual(expect.any(Error));
    expect(result.current.error).toBe(errorMessage);
  });
});
