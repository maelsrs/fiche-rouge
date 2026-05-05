import countries from "i18n-iso-countries";
import countriesFr from "i18n-iso-countries/langs/fr.json";
import languages from "@cospired/i18n-iso-languages";
import languagesFr from "@cospired/i18n-iso-languages/langs/fr.json";

countries.registerLocale(countriesFr);
languages.registerLocale(languagesFr);

// Interpol renvoie des codes en majuscules. Les libs s'en fichent pour les pays
// (FR), mais pour les langues elles attendent du minuscule (eng vs ENG).
export function getCountryName(code: string | null | undefined): string | null {
  if (!code) return null;
  return countries.getName(code, "fr") ?? code;
}

export function getLanguageName(
  code: string | null | undefined,
): string | null {
  if (!code) return null;
  return languages.getName(code.toLowerCase(), "fr") ?? code;
}
