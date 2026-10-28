/**
 * Add/edit address form fields — RN services/address/addressFieldConfig.js
 * (labels, placeholders, required-messages are the app's own, per language)
 * plus the input filters from useAddressForm. Client + server safe: the API
 * routes re-validate with the same rules.
 */
import type { LocalizedText } from "@/types/product";

export type AddressFields = {
  name: string;
  address: string;
  areaName: string;
  pincode: string;
  townName: string;
  districtName: string;
  stateName: string;
  stateId?: number;
  landmark: string;
};

export type FieldKey = Exclude<keyof AddressFields, "stateId">;

type FieldDef = {
  label: LocalizedText;
  placeholder: LocalizedText;
  required: LocalizedText;
  maxLength: number;
  /** Characters allowed while typing (RN input filters). */
  allowed?: RegExp;
  autoFill?: boolean;
};

const LETTERS = /^[\p{L}\p{M} .]*$/u;
const ADDRESS_CHARS = /^[\p{L}\p{M}\p{N} ,\-/.#]*$/u;

/** In the app's order (`order` 1–8). */
export const ADDRESS_FIELDS: [FieldKey, FieldDef][] = [
  ["name", {
    label: { en: "Full name", hi: "पूरा नाम", te: "పూర్తి పేరు", kn: "ಪೂರ್ಣ ಹೆಸರು", mr: "पूर्ण नाव" },
    placeholder: { en: "Enter full name", hi: "पूरा नाम दर्ज करें", te: "పూర్తి పేరు నమోదు చేయండి", kn: "ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ", mr: "पूर्ण नाव प्रविष्ट करा" },
    required: { en: "Please enter name", hi: "कृपया नाम दर्ज करें", te: "దయచేసి పేరు నమోదు చేయండి", kn: "ದಯವಿಟ್ಟು ಹೆಸರನ್ನು ನಮೂದಿಸಿ", mr: "कृपया नाव प्रविष्ट करा" },
    maxLength: 50,
    allowed: LETTERS,
  }],
  ["address", {
    label: { en: "Flat / House no (If Any)", hi: "फ्लैट / मकान नं (यदि हो)", te: "ఫ్లాట్ / ఇంటి నంబర్ (ఉంటే)", kn: "ಫ್ಲ್ಯಾಟ್ / ಮನೆ ನಂ (ಇದ್ದರೆ)", mr: "फ्लॅट / घर क्र. (असल्यास)" },
    placeholder: { en: "Enter flat / house no.", hi: "फ्लैट / मकान नं दर्ज करें", te: "ఫ్లాట్ / ఇంటి నంబర్ నమోదు చేయండి", kn: "ಫ್ಲ್ಯಾಟ್ / ಮನೆ ನಂ ನಮೂದಿಸಿ", mr: "फ्लॅट / घर क्र. प्रविष्ट करा" },
    required: { en: "Please enter street name", hi: "कृपया सड़क का नाम दर्ज करें", te: "దయచేసి వీధి పేరును నమోదు చేయండి", kn: "ದಯವಿಟ್ಟು ರಸ್ತೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ", mr: "कृपया रस्त्याचे नाव प्रविष्ट करा" },
    maxLength: 150,
    allowed: ADDRESS_CHARS,
  }],
  ["areaName", {
    label: { en: "Area / Street / Village / Taluk", hi: "क्षेत्र / गली / गाँव / तालुक", te: "ప్రాంతం / వీధి / గ్రామం / తాలుకా", kn: "ಪ್ರದೇಶ / ಬೀದಿ / ಗ್ರಾಮ / ತಾಲೂಕು", mr: "क्षेत्र / रस्ता / गाव / तालुका" },
    placeholder: { en: "Enter area / street / village / taluk", hi: "क्षेत्र / गली / गाँव / तालुक दर्ज करें", te: "ప్రాంతం / వీధి / గ్రామం / తాలుకా నమోదు చేయండి", kn: "ಪ್ರದೇಶ / ಬೀದಿ / ಗ್ರಾಮ / ತಾಲೂಕು ನಮೂದಿಸಿ", mr: "क्षेत्र / रस्ता / गाव / तालुका प्रविष्ट करा" },
    required: { en: "Please enter area name", hi: "कृपया क्षेत्र का नाम दर्ज करें", te: "దయచేసి ప్రాంతం పేరును నమోదు చేయండి", kn: "ದಯವಿಟ್ಟು ಪ್ರದೇಶದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ", mr: "कृपया क्षेत्राचे नाव प्रविष्ट करा" },
    maxLength: 150,
    allowed: ADDRESS_CHARS,
    autoFill: true,
  }],
  ["pincode", {
    label: { en: "Pincode", hi: "पिनकोड", te: "పిన్‌కోడ్", kn: "ಪಿನ್‌ಕೋಡ್", mr: "पिनकोड" },
    placeholder: { en: "Enter 6-digit pincode", hi: "6 अंकों का पिनकोड दर्ज करें", te: "6 అంకెల పిన్‌కోడ్ నమోదు చేయండి", kn: "6 ಅಂಕಿಯ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ", mr: "6 अंकी पिनकोड प्रविष्ट करा" },
    required: { en: "Please enter pincode", hi: "कृपया पिनकोड दर्ज करें", te: "దయచేసి పిన్‌కోడ్ నమోదు చేయండి", kn: "ದಯವಿಟ್ಟು ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ", mr: "कृपया पिनकोड प्रविष्ट करा" },
    maxLength: 6,
    allowed: /^\d*$/,
  }],
  ["townName", {
    label: { en: "City", hi: "शहर", te: "నగరం", kn: "ನಗರ", mr: "शहर" },
    placeholder: { en: "Enter city", hi: "शहर दर्ज करें", te: "నగరం నమోదు చేయండి", kn: "ನಗರ ನಮೂದಿಸಿ", mr: "शहर प्रविष्ट करा" },
    required: { en: "Please enter City name", hi: "कृपया शहर का नाम दर्ज करें", te: "దయచేసి నగరం పేరును నమోదు చేయండి", kn: "ದಯವಿಟ್ಟು ನಗರದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ", mr: "कृपया शहराचे नाव प्रविष्ट करा" },
    maxLength: 50,
    allowed: LETTERS,
    autoFill: true,
  }],
  ["districtName", {
    label: { en: "District", hi: "जिला", te: "జిల్లా", kn: "ಜಿಲ್ಲೆ", mr: "जिल्हा" },
    placeholder: { en: "Enter district", hi: "जिला दर्ज करें", te: "జిల్లా నమోదు చేయండి", kn: "ಜಿಲ್ಲೆ ನಮೂದಿಸಿ", mr: "जिल्हा प्रविष्ट करा" },
    required: { en: "Please enter district", hi: "कृपया जिला दर्ज करें", te: "దయచేసి జిల్లా నమోదు చేయండి", kn: "ದಯವಿಟ್ಟು ಜಿಲ್ಲೆಯನ್ನು ನಮೂದಿಸಿ", mr: "कृपया जिल्हा प्रविष्ट करा" },
    maxLength: 50,
    allowed: LETTERS,
  }],
  ["stateName", {
    label: { en: "State", hi: "राज्य", te: "రాష్ట్రం", kn: "ರಾಜ್ಯ", mr: "राज्य" },
    placeholder: { en: "Enter state", hi: "राज्य दर्ज करें", te: "రాష్ట్రం నమోదు చేయండి", kn: "ರಾಜ್ಯ ನಮೂದಿಸಿ", mr: "राज्य प्रविष्ट करा" },
    required: { en: "Please enter state", hi: "कृपया राज्य दर्ज करें", te: "దయచేసి రాష్ట్రం నమోదు చేయండి", kn: "ದಯವಿಟ್ಟು ರಾಜ್ಯವನ್ನು ನಮೂದಿಸಿ", mr: "कृपया राज्य प्रविष्ट करा" },
    maxLength: 60,
    autoFill: true,
  }],
  ["landmark", {
    label: { en: "Landmark", hi: "लैंडमार्क", te: "ల్యాండ్‌మార్క్", kn: "ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್", mr: "खुणेची जागा" },
    placeholder: { en: "Enter nearby landmark", hi: "पास का लैंडमार्क दर्ज करें", te: "సమీపంలోని ల్యాండ్‌మార్క్ నమోదు చేయండి", kn: "ಹತ್ತಿರದ ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್ ನಮೂದಿಸಿ", mr: "जवळची खूण प्रविष्ट करा" },
    required: { en: "Please enter landmark", hi: "कृपया लैंडमार्क दर्ज करें", te: "దయచేసి గుర్తింపు స్థలాన్ని నమోదు చేయండి", kn: "ದಯವಿಟ್ಟು ಹೆಗ್ಗುರುತನ್ನು ನಮೂದಿಸಿ", mr: "कृपया ओळखण्याजोगे ठिकाण प्रविष्ट करा" },
    maxLength: 100,
    allowed: ADDRESS_CHARS,
  }],
];

export const PINCODE_INVALID: LocalizedText = {
  en: "Please enter a valid 6-digit pincode",
  hi: "सही 6 अंकों का पिनकोड डालें",
  kn: "ದಯವಿಟ್ಟು ಸರಿಯಾದ 6 ಅಂಕೆಯ ಪಿನ್‌ಕೋಡ್ ಹಾಕಿ",
  mr: "कृपया योग्य 6-अंकी पिनकोड टाका",
  te: "దయచేసి సరైన 6 అంకెల పిన్‌కోడ్ నమోదు చేయండి",
};

export const EMPTY_ADDRESS: AddressFields = {
  name: "", address: "", areaName: "", pincode: "", townName: "", districtName: "", stateName: "", landmark: "",
};

/** First problem in field order (RN validateAllFields stops at the first), or null. */
export function validateAddress(f: AddressFields): { field: FieldKey; message: LocalizedText } | null {
  for (const [key, def] of ADDRESS_FIELDS) {
    const v = (f[key] ?? "").trim();
    if (!v) return { field: key, message: def.required };
    if (v.length > def.maxLength || (def.allowed && !def.allowed.test(v))) return { field: key, message: def.required };
    if (key === "pincode" && !/^[1-9]\d{5}$/.test(v)) return { field: key, message: PINCODE_INVALID };
  }
  return null;
}

/** Saved-address object from the backend → form values (RN addressMapper.toFormFields). */
export function toFormFields(raw: Record<string, unknown>): AddressFields {
  const s = (k: string) => (typeof raw[k] === "string" || typeof raw[k] === "number" ? String(raw[k]) : "");
  return {
    name: s("name"),
    address: s("address") || s("flatNumber"),
    areaName: s("areaName") || s("village"),
    pincode: s("pincode"),
    townName: s("townName") || s("town"),
    districtName: s("district"),
    stateName: s("state") || s("stateName"),
    stateId: typeof raw.stateId === "number" ? raw.stateId : undefined,
    landmark: s("landmark"),
  };
}

/** Form values → the address object the backend stores (RN buildCreateAddressPayload / buildUpdateAddressPayload). */
export function toAddressPayload(f: AddressFields, existing?: Record<string, unknown>): Record<string, unknown> {
  const fields = {
    name: f.name.trim(),
    address: f.address.trim(),
    areaName: f.areaName.trim(),
    village: f.areaName.trim(),
    district: f.districtName.trim(),
    state: f.stateName.trim(),
    stateId: f.stateId,
    townName: f.townName.trim(),
    town: f.townName.trim(),
    pincode: f.pincode.trim(),
    landmark: f.landmark.trim(),
    defaultAddress: true,
  };
  return existing ? { ...existing, flatNumber: "", ...fields } : fields;
}
