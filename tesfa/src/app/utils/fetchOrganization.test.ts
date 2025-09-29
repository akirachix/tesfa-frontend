import { fetchProfile, updateUser } from './fetchOrganizations';
import { getToken } from './getToken';

jest.mock('./getToken');

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockLocalStorage.clear();
  (global.fetch as jest.Mock).mockClear();
});

describe('fetchProfile', () => {
  it('throws if no token in localStorage', async () => {
    (getToken as jest.Mock).mockReturnValue(null);
    mockLocalStorage.getItem.mockImplementation((key) =>
      key === 'user_id' ? '123' : null
    );

    await expect(fetchProfile()).rejects.toThrow('No token found in localStorage.');
  });

  it('throws if no user_id in localStorage', async () => {
    (getToken as jest.Mock).mockReturnValue('abc123');
    mockLocalStorage.getItem.mockImplementation((key) =>
      key === 'token' ? 'abc123' : null
    );

    await expect(fetchProfile()).rejects.toThrow('No user ID found in localStorage.');
  });

  it('fetches profile successfully', async () => {
    (getToken as jest.Mock).mockReturnValue('abc123');
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user_id') return '123';
      return null;
    });

    const mockResponse = { name: 'Acme Inc' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchProfile();
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith('/api/organizations?userId=123', {
      headers: { Authorization: 'Token abc123' },
      cache: 'no-store',
    });
  });

  it('throws on non-ok response', async () => {
    (getToken as jest.Mock).mockReturnValue('abc123');
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user_id') return '123';
      return null;
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve('error'),
    });

    await expect(fetchProfile()).rejects.toThrow('Make sure to make changes before saving.');
  });

  it('throws with original error message on network error', async () => {
    (getToken as jest.Mock).mockReturnValue('abc123');
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user_id') return '123';
      return null;
    });

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

    await expect(fetchProfile()).rejects.toThrow('Network failure');
  });
});

describe('updateUser', () => {
  const mockData = { name: 'New Name' };

  it('throws if no token in localStorage', async () => {
    (getToken as jest.Mock).mockReturnValue(null);
    mockLocalStorage.getItem.mockImplementation((key) =>
      key === 'user_id' ? '123' : null
    );

    await expect(updateUser(mockData)).rejects.toThrow('No token found in localStorage.');
  });

  it('throws if no user_id in localStorage', async () => {
    (getToken as jest.Mock).mockReturnValue('abc123');
    mockLocalStorage.getItem.mockImplementation((key) =>
      key === 'token' ? 'abc123' : null
    );

    await expect(updateUser(mockData)).rejects.toThrow('No user ID found in localStorage.');
  });

  it('sends JSON data correctly', async () => {
    (getToken as jest.Mock).mockReturnValue('abc123');
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user_id') return '123';
      return null;
    });

    const mockResponse = { success: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await updateUser(mockData);

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith('/api/organizations?userId=123', {
      method: 'PUT',
      headers: {
        Authorization: 'Token abc123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockData),
      cache: 'no-store',
    });
  });

  it('sends FormData without Content-Type', async () => {
    (getToken as jest.Mock).mockReturnValue('abc123');
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user_id') return '123';
      return null;
    });

    const formData = new FormData();
    formData.append('name', 'New Name');

    const mockResponse = { success: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await updateUser(formData);

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith('/api/organizations?userId=123', {
      method: 'PUT',
      headers: {
        Authorization: 'Token abc123',
      },
      body: formData,
      cache: 'no-store',
    });
  });

  it('throws on non-ok response', async () => {
    (getToken as jest.Mock).mockReturnValue('abc123');
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user_id') return '123';
      return null;
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve('error'),
    });

    await expect(updateUser(mockData)).rejects.toThrow('Make sure to make changes before saving.');
  });

  it('throws with original error message on network error', async () => {
    (getToken as jest.Mock).mockReturnValue('abc123');
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user_id') return '123';
      return null;
    });
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

    await expect(updateUser(mockData)).rejects.toThrow('Network failure');
  });
});
