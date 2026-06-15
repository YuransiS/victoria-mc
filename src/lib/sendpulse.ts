let cachedToken: string | null = null;
let tokenExpiry: number = 0; // timestamp in ms

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SENDPULSE_CLIENT_ID;
  const clientSecret = process.env.SENDPULSE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('SendPulse credentials are not configured in environment variables.');
  }

  const now = Date.now();
  if (cachedToken && tokenExpiry > now + 60000) { // token still valid for at least 1 min
    return cachedToken;
  }

  const response = await fetch('https://api.sendpulse.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to authenticate with SendPulse: ${response.status} ${text}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000);
  return cachedToken!;
}

export async function updateSendPulseStatus(contactId: string, status: string) {
  try {
    const token = await getAccessToken();
    const response = await fetch('https://api.sendpulse.com/messenger/contacts/setVariable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        contact_id: contactId,
        name: 'vsl_status',
        value: status
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[SendPulse] Failed to update variable for contact ${contactId}: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json();
    console.log(`[SendPulse] Successfully updated variable for contact ${contactId} to: ${status}`, data);
    return true;
  } catch (err: any) {
    console.error(`[SendPulse] Error updating variable:`, err.message || err);
    return false;
  }
}
