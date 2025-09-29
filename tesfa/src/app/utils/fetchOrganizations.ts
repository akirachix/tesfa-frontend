import { User } from './type';
import { getToken } from './getToken';


function getUserId() {
  return localStorage.getItem('user_id');
}

export async function fetchProfile() {
  const token = getToken();
  const userId = getUserId();

  if (!token) throw new Error('No token found in localStorage.');
  if (!userId) throw new Error('No user ID found in localStorage.');

  try {
    const response = await fetch(`/api/organizations?userId=${userId}`, {
      headers: { Authorization: `Token ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Make sure to make changes before saving.');
    }

    return await response.json();
  } catch (error) {
    throw new Error((error as Error).message || 'Invalid response format from server.');
  }
}

type UserUpdateData = Record<string, string | number | boolean>;

export async function updateUser(data: FormData | UserUpdateData) {
  const token = getToken();
  const userId = getUserId();

  if (!token) throw new Error('No token found in localStorage.');
  if (!userId) throw new Error('No user ID found in localStorage.');

  try {
    let body;
    const headers: Record<string, string> = { Authorization: `Token ${token}` };

    if (data instanceof FormData) {
      body = data;
    } else {
      body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`/api/organizations?userId=${userId}`, {
      method: 'PUT',
      headers,
      body,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Make sure to make changes before saving.');
    }

    return await response.json();
  } catch (error) {
    throw new Error((error as Error).message || 'Invalid response format from server.');
  }
}


export async function fetchUsers(): Promise<User[]> {
  const token = getToken();
  if (!token) throw new Error('No token found in localStorage.');

  try {
    const response = await fetch('/api/organizations/', {
      headers: { Authorization: `Token ${token}` },
      cache: 'no-store',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch users');
    }

    return data;
  } catch (error) {
    throw new Error((error as Error).message || 'Invalid response format from server.');
  }
}

export async function fetchOrganizationsAdmin(): Promise<User[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication token not found in local storage');

  const response = await fetch(`/api/organizations`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch organizations' }));
    throw new Error(errorData.message);
  }

  const data = await response.json();
  return data;
}