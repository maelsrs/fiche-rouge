const BASE_URL = "https://ws-public.interpol.int/notices/v1";

export interface Notice {
  entity_id: string;
  forename: string;
  name: string;
  date_of_birth: string;
  nationalities: string[];
  _links: {
    self: { href: string };
    images: { href: string };
    thumbnail: { href: string };
  };
}

interface NoticesResponse {
  _embedded: { notices: Notice[] };
  total: number;
}

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getNoticesByNationality(nationality: string): Promise<Notice[]> {
  const data = await api<NoticesResponse>(`/red?nationality=${nationality}`);
  return data._embedded.notices;
}

export async function getLastNotices(count: number): Promise<Notice[]> {
  const data = await api<NoticesResponse>(`/red?resultPerPage=${count}`);
  return data._embedded.notices;
}
