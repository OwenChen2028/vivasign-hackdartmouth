const configuredBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
export const API_BASE_URL = configuredBaseUrl.replace(/\/$/, '');

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const body = await response.text();

  if (!response.ok) {
    let message = body || `Request failed with status ${response.status}`;
    try {
      message = JSON.parse(body).error || message;
    } catch {
      // The deployed API may still return plain-text errors.
    }
    throw new Error(message);
  }

  return body;
}

export async function getSigns() {
  const body = await request('/signs');
  return JSON.parse(body).signs;
}

export function evaluateFrame({ signName, frameNumber, imageBase64 }) {
  const formData = new FormData();
  formData.append('signName', signName);
  formData.append('frameNumber', frameNumber);
  formData.append('imageBase64', imageBase64);
  return request('/evaluate', { method: 'POST', body: formData });
}

export async function getHints(signName) {
  const query = `?signName=${encodeURIComponent(signName)}`;
  const [video, text] = await Promise.all([
    request(`/video${query}`),
    request(`/explain${query}`),
  ]);
  return { text, video };
}
