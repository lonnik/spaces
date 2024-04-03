import { auth } from "../../firebase";
import { getApiUrl } from "./get_api_url";

export class FetchError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export const fetchApi = async <T>(url: string, options?: RequestInit) => {
  const baseUrl = getApiUrl();

  if (auth.currentUser) {
    const idToken = await auth.currentUser.getIdToken();

    options = {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${idToken}`,
      },
    };
  }

  const res = await fetch(baseUrl + url, options);

  if (!res.ok) {
    throw new FetchError(res.statusText, res.status);
  }

  const jsonData = (await res.json()) as { data: T };

  return jsonData.data;
};
