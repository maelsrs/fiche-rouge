import { fetch } from "expo/fetch";

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

export interface NoticeDetail extends Notice {
  sex_id: string | null;
  place_of_birth: string | null;
  country_of_birth_id: string | null;
  distinguishing_marks: string | null;
  weight: number;
  height: number;
  eyes_colors_id: string | null;
  hairs_id: string | null;
  languages_spoken_ids: string[] | null;
  arrest_warrants: {
    charge: string;
    issuing_country_id: string;
    charge_translation: string | null;
  }[];
}

interface NoticesResponse {
  _embedded: { notices: Notice[] };
  total: number;
  _links?: { next?: { href: string } };
}

export interface NoticesPage {
  notices: Notice[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface SearchParams {
  page?: number;
  resultPerPage?: number;
  name?: string;
  sexId?: "M" | "F";
  nationality?: string;
}

const IOS_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const COMMON_HEADERS = {
  "User-Agent": IOS_USER_AGENT,
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
  Referer: "https://www.interpol.int/",
  Origin: "https://www.interpol.int",
};

export const IMAGE_HEADERS = {
  "User-Agent": IOS_USER_AGENT,
  Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
  "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
  Referer: "https://www.interpol.int/",
  Origin: "https://www.interpol.int",
};

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: COMMON_HEADERS,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getNoticesByNationality(
  nationality: string,
): Promise<Notice[]> {
  const data = await api<NoticesResponse>(`/red?nationality=${nationality}`);
  return data._embedded.notices;
}

export async function getLastNotices(count: number): Promise<Notice[]> {
  const data = await api<NoticesResponse>(`/red?resultPerPage=${count}`);
  return data._embedded.notices;
}

export async function getNotices(params: SearchParams = {}): Promise<NoticesPage> {
  const sp = new URLSearchParams();
  const page = params.page ?? 1;
  sp.set("page", String(page));
  sp.set("resultPerPage", String(params.resultPerPage ?? 20));
  if (params.name) sp.set("name", params.name);
  if (params.sexId) sp.set("sexId", params.sexId);
  if (params.nationality) sp.set("nationality", params.nationality);

  const data = await api<NoticesResponse>(`/red?${sp.toString()}`);
  return {
    notices: data._embedded.notices,
    total: data.total,
    page,
    hasMore: !!data._links?.next,
  };
}

export async function getNoticeDetail(entityId: string): Promise<NoticeDetail> {
  return api<NoticeDetail>(`/red/${encodeURIComponent(entityId)}`);
}
