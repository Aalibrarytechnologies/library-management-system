// src/utils/retryFetch.js
export async function retryFetch(url, options = {}, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Token expired or invalid — signal for logout/redirect
          const errorData = await res.json().catch(() => ({}));
          throw {
            type: "AUTH_ERROR",
            status: res.status,
            message: errorData?.detail || "Authentication error",
          };
        }
        throw res;
      }
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay * Math.pow(2, i)));
    }
  }
}
