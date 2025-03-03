import i18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";
import i18nextBackend from "i18next-fs-backend";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

i18next
  .use(i18nextBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, "../locales/{{lng}}/{{ns}}.json"),
    },
    fallbackLng: "en",
    preload: ["en", "es"],
    ns: ["translation"],
    defaultNS: "translation",
    detection: {
      order: ["header"],
      lookupHeader: "accept-language",
    },
    initImmediate: false,
  });

export default i18nextMiddleware.handle(i18next);
