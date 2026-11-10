/** Parse API replies even when the hosting platform returns an HTML error page. */
export async function readApiResponse<T>(response: Response): Promise<T> {
  const body = await response.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = JSON.parse(body);
  } catch {
    // An HTML error page should not turn into a confusing JSON parse error.
  }

  if (!response.ok || !data || data.success === false) {
    const message = typeof data?.error === 'string'
      ? data.error
      : `Request failed (HTTP ${response.status}). Check Vercel Function logs and /api/health.`;
    throw new Error(message);
  }
  return data as T;
}
