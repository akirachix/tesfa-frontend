const baseUrl = '/api/password-reset-confirm';

export async function fetchPasswordResetConfirm(payload: { [key: string]: string | number | boolean | null | undefined }) {
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error confirming password reset: ${message}`);
  }
}
