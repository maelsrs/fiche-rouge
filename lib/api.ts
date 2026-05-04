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
}

let debugged = false;
async function debug() {
  if (debugged) return;
  debugged = true;
  try {
    const res = await fetch("https://httpbin.org/headers");
    const json = await res.json();
    console.log(
      "[whoami] headers envoyés:",
      JSON.stringify(json.headers, null, 2),
    );
  } catch (e) {
    console.log("[whoami] failed:", e);
  }
}

async function api<T>(path: string): Promise<T> {
  await debug();
  const url = `${BASE_URL}${path}`;
  console.log("[api] →", url);

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        Origin: "https://www.interpol.int",
        Referer: "https://www.interpol.int/",
      },
    });

    console.log("[api] ←", res.status, url);
    console.log(
      "[api] headers:",
      JSON.stringify(Object.fromEntries(res.headers as any)),
    );

    if (!res.ok) {
      const body = await res.text();
      console.log("[api] error body:", body.slice(0, 500));
      throw new Error(`API error: ${res.status}`);
    }

    return res.json();
  } catch (e) {
    console.log("[api] fetch failed:", e);
    throw e;
  }
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

export async function getNoticeDetail(entityId: string): Promise<NoticeDetail> {
  return api<NoticeDetail>(`/red/${entityId}`);
}
