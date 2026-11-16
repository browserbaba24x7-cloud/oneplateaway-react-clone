// Replace with your real chat backend. The original site sends the message,
// the history ({ role, parts: [{ text }] }) and a context string to its own API.
export async function chatWithAI(message, history) {
  const url = import.meta.env.VITE_CHAT_API_URL;
  if (!url) throw new Error('VITE_CHAT_API_URL is not set');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error(`Chat API error ${res.status}`);
  const data = await res.json();
  return data.reply;
}
