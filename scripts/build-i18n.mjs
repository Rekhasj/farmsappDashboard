// Builds src/i18n/dictionaries/{en,hi,kn,mr,te}.json — edit THIS file, not the JSON.
//   node scripts/build-i18n.mjs <farmsapp>/src/locales src/i18n/dictionaries
// Each entry: [english, farmsappKey | null, { hi, kn, mr, te }]
// When farmsappKey is set and present in that farmsapp locale, the app's wording wins
// (unless REVIEW forces a fix), so the website reads the same as the mobile app.
import fs from "node:fs";
import path from "node:path";

const [, , farmsappLocales, outDir] = process.argv;
const LANGS = ["hi", "kn", "mr", "te"];
const src = Object.fromEntries(
  ["en", ...LANGS].map((l) => [l, JSON.parse(fs.readFileSync(path.join(farmsappLocales, `${l}.json`), "utf8"))]),
);

const E = {
  // common
  "common.home": ["Home", "Home", { hi: "होम", kn: "ಮುಖಪುಟ", mr: "होम", te: "హోమ్" }],
  "common.categories": ["Categories", "Categories", { hi: "श्रेणियाँ", kn: "ವರ್ಗಗಳು", mr: "श्रेणी", te: "వర్గాలు" }],
  "common.myOrders": ["My Orders", "My Orders", { hi: "मेरे ऑर्डर", kn: "ನನ್ನ ಆರ್ಡರ್‌ಗಳು", mr: "माझ्या ऑर्डर", te: "నా ఆర్డర్‌లు" }],
  "common.profile": ["Profile", "Profile", { hi: "प्रोफ़ाइल", kn: "ಪ್ರೊಫೈಲ್", mr: "प्रोफाइल", te: "ప్రొఫైల్" }],
  "common.viewAll": ["View all", "View All", { hi: "सभी देखें", kn: "ಎಲ್ಲವನ್ನೂ ನೋಡಿ", mr: "सर्व पहा", te: "అన్నీ చూడండి" }],
  "common.back": ["Back", "Back", { hi: "वापस", kn: "ಹಿಂದೆ", mr: "मागे", te: "వెనుకకు" }],
  "common.backToHome": ["Back to Home", null, { hi: "होम पर वापस जाएँ", kn: "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ", mr: "होमवर परत जा", te: "హోమ్‌కు తిరిగి వెళ్ళండి" }],
  "common.next": ["Next", "Next", { hi: "आगे", kn: "ಮುಂದೆ", mr: "पुढे", te: "తదుపరి" }],
  "common.previous": ["Previous", "Previous", { hi: "पिछला", kn: "ಹಿಂದಿನ", mr: "मागील", te: "మునుపటి" }],
  "common.close": ["Close", null, { hi: "बंद करें", kn: "ಮುಚ್ಚಿ", mr: "बंद करा", te: "మూసివేయండి" }],
  "common.loading": ["Loading…", "Loading...", { hi: "लोड हो रहा है…", kn: "ಲೋಡ್ ಆಗುತ್ತಿದೆ…", mr: "लोड होत आहे…", te: "లోడ్ అవుతోంది…" }],
  "common.outOfStock": ["Out of Stock", "Outofstock", { hi: "स्टॉक में नहीं", kn: "ಸ್ಟಾಕ್ ಇಲ್ಲ", mr: "स्टॉक संपला", te: "స్టాక్ లేదు" }],
  "common.percentOff": ["{{percent}}% Off", "pdpPercentOff", { hi: "{{percent}}% छूट", kn: "{{percent}}% ರಿಯಾಯಿತಿ", mr: "{{percent}}% सूट", te: "{{percent}}% తగ్గింపు" }],
  "common.noProducts": ["No products found.", null, { hi: "कोई उत्पाद नहीं मिला।", kn: "ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಸಿಗಲಿಲ್ಲ.", mr: "कोणतीही उत्पादने आढळली नाहीत.", te: "ఉత్పత్తులు ఏవీ కనబడలేదు." }],
  "common.somethingWentWrong": ["Something went wrong", null, { hi: "कुछ गलत हो गया", kn: "ಏನೋ ತಪ್ಪಾಗಿದೆ", mr: "काहीतरी चूक झाली", te: "ఏదో తప్పు జరిగింది" }],
  "common.pageLoadFailed": ["We couldn't load this page. Please try again.", null, { hi: "यह पेज लोड नहीं हो सका। कृपया फिर से प्रयास करें।", kn: "ಈ ಪುಟವನ್ನು ಲೋಡ್ ಮಾಡಲು ಆಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", mr: "हे पेज लोड होऊ शकले नाही. कृपया पुन्हा प्रयत्न करा.", te: "ఈ పేజీని లోడ్ చేయలేకపోయాం. దయచేసి మళ్ళీ ప్రయత్నించండి." }],
  "common.tryAgain": ["Try again", null, { hi: "फिर से प्रयास करें", kn: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ", mr: "पुन्हा प्रयत्न करा", te: "మళ్ళీ ప్రయత్నించండి" }],
  "common.pageNotFound": ["Page not found", null, { hi: "पेज नहीं मिला", kn: "ಪುಟ ಸಿಗಲಿಲ್ಲ", mr: "पेज सापडले नाही", te: "పేజీ కనబడలేదు" }],
  "common.language": ["Language", "Language", { hi: "भाषा", kn: "ಭಾಷೆ", mr: "भाषा", te: "భాష" }],
  "common.chooseLanguage": ["Choose language", null, { hi: "भाषा चुनें", kn: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ", mr: "भाषा निवडा", te: "భాషను ఎంచుకోండి" }],
  "common.viewCart": ["View cart", null, { hi: "कार्ट देखें", kn: "ಕಾರ್ಟ್ ನೋಡಿ", mr: "कार्ट पहा", te: "కార్ట్ చూడండి" }],
  "common.dismiss": ["Dismiss", null, { hi: "हटाएँ", kn: "ಮುಚ್ಚಿ", mr: "बंद करा", te: "తీసివేయండి" }],

  // home
  "home.offerTitle": ["Get ₹100 off your 1st order!", null, { hi: "अपने पहले ऑर्डर पर ₹100 की छूट पाएँ!", kn: "ನಿಮ್ಮ ಮೊದಲ ಆರ್ಡರ್‌ಗೆ ₹100 ರಿಯಾಯಿತಿ ಪಡೆಯಿರಿ!", mr: "तुमच्या पहिल्या ऑर्डरवर ₹100 सूट मिळवा!", te: "మీ మొదటి ఆర్డర్‌పై ₹100 తగ్గింపు పొందండి!" }],
  "home.offerSubtitle": ["Exclusively on the FarmsApp app.", null, { hi: "केवल FarmsApp ऐप पर।", kn: "FarmsApp ಆ್ಯಪ್‌ನಲ್ಲಿ ಮಾತ್ರ.", mr: "फक्त FarmsApp ॲपवर.", te: "FarmsApp యాప్‌లో మాత్రమే." }],
  "home.downloadApp": ["Download App", null, { hi: "ऐप डाउनलोड करें", kn: "ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ", mr: "ॲप डाउनलोड करा", te: "యాప్ డౌన్‌లోడ్ చేయండి" }],
  "home.bestSelling": ["Best Selling products", null, { hi: "सबसे ज़्यादा बिकने वाले उत्पाद", kn: "ಹೆಚ್ಚು ಮಾರಾಟವಾಗುವ ಉತ್ಪನ್ನಗಳು", mr: "सर्वाधिक विकली जाणारी उत्पादने", te: "ఎక్కువగా అమ్ముడయ్యే ఉత్పత్తులు" }],
  "home.allProducts": ["All Products", "All Products", { hi: "सभी उत्पाद", kn: "ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು", mr: "सर्व उत्पादने", te: "అన్ని ఉత్పత్తులు" }],
  "home.recentlyViewed": ["Recently Viewed", null, { hi: "हाल ही में देखे गए", kn: "ಇತ್ತೀಚೆಗೆ ನೋಡಿದವು", mr: "अलीकडे पाहिलेले", te: "ఇటీవల చూసినవి" }],
  "home.shopByCrop": ["Shop By Crop", null, { hi: "फसल के अनुसार खरीदें", kn: "ಬೆಳೆಯ ಪ್ರಕಾರ ಖರೀದಿಸಿ", mr: "पिकानुसार खरेदी करा", te: "పంట ప్రకారం కొనండి" }],
  "home.shopByCropSubtitle": ["Expert products for every growth stage.", "ExpertCropProductsSubtitle", { hi: "हर विकास चरण के लिए विशेषज्ञ उत्पाद।", kn: "ಪ್ರತಿ ಬೆಳವಣಿಗೆಯ ಹಂತಕ್ಕೂ ತಜ್ಞ ಉತ್ಪನ್ನಗಳು.", mr: "प्रत्येक वाढीच्या टप्प्यासाठी तज्ञ उत्पादने.", te: "ప్రతి ఎదుగుదల దశకు నిపుణుల ఉత్పత్తులు." }],
  "home.trackOrder": ["Track Order", "TrackOrder", { hi: "ऑर्डर ट्रैक करें", kn: "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ", mr: "ऑर्डर ट्रॅक करा", te: "ఆర్డర్ ట్రాక్ చేయండి" }],
  "home.promotion": ["Promotion {{n}}", null, { hi: "प्रचार {{n}}", kn: "ಪ್ರಚಾರ {{n}}", mr: "जाहिरात {{n}}", te: "ప్రమోషన్ {{n}}" }],
  "home.previousBanner": ["Previous banner", null, { hi: "पिछला बैनर", kn: "ಹಿಂದಿನ ಬ್ಯಾನರ್", mr: "मागील बॅनर", te: "మునుపటి బ్యానర్" }],
  "home.nextBanner": ["Next banner", null, { hi: "अगला बैनर", kn: "ಮುಂದಿನ ಬ್ಯಾನರ್", mr: "पुढील बॅनर", te: "తదుపరి బ్యానర్" }],
  "home.goToBanner": ["Go to banner {{n}}", null, { hi: "बैनर {{n}} पर जाएँ", kn: "ಬ್ಯಾನರ್ {{n}} ಗೆ ಹೋಗಿ", mr: "बॅनर {{n}} वर जा", te: "బ్యానర్ {{n}}కి వెళ్ళండి" }],

  // browse
  "browse.allCategories": ["All Categories", null, { hi: "सभी श्रेणियाँ", kn: "ಎಲ್ಲಾ ವರ್ಗಗಳು", mr: "सर्व श्रेणी", te: "అన్ని వర్గాలు" }],
  "browse.allCrops": ["All Crops", "AllCrops", { hi: "सभी फसलें", kn: "ಎಲ್ಲಾ ಬೆಳೆಗಳು", mr: "सर्व पिके", te: "అన్ని పంటలు" }],
  "browse.noCategories": ["No categories found.", null, { hi: "कोई श्रेणी नहीं मिली।", kn: "ಯಾವುದೇ ವರ್ಗಗಳು ಸಿಗಲಿಲ್ಲ.", mr: "कोणतीही श्रेणी आढळली नाही.", te: "వర్గాలు ఏవీ కనబడలేదు." }],
  "browse.noCrops": ["No crops found.", null, { hi: "कोई फसल नहीं मिली।", kn: "ಯಾವುದೇ ಬೆಳೆಗಳು ಸಿಗಲಿಲ್ಲ.", mr: "कोणतीही पिके आढळली नाहीत.", te: "పంటలు ఏవీ కనబడలేదు." }],
  "browse.noCropProducts": ["No products found for this crop.", null, { hi: "इस फसल के लिए कोई उत्पाद नहीं मिला।", kn: "ಈ ಬೆಳೆಗೆ ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಸಿಗಲಿಲ್ಲ.", mr: "या पिकासाठी कोणतीही उत्पादने आढळली नाहीत.", te: "ఈ పంటకు ఉత్పత్తులు ఏవీ కనబడలేదు." }],
  "browse.bestSellingTitle": ["Best Selling Products", null, { hi: "सबसे ज़्यादा बिकने वाले उत्पाद", kn: "ಹೆಚ್ಚು ಮಾರಾಟವಾಗುವ ಉತ್ಪನ್ನಗಳು", mr: "सर्वाधिक विकली जाणारी उत्पादने", te: "ఎక్కువగా అమ్ముడయ్యే ఉత్పత్తులు" }],
  "browse.pagination": ["Pagination", null, { hi: "पेज", kn: "ಪುಟಗಳು", mr: "पेज", te: "పేజీలు" }],
  "browse.pageOf": ["Page {{page}} of {{total}}", null, { hi: "पेज {{page}} / {{total}}", kn: "ಪುಟ {{page}} / {{total}}", mr: "पेज {{page}} / {{total}}", te: "పేజీ {{page}} / {{total}}" }],

  // search
  "search.title": ["Search", "Search", { hi: "खोजें", kn: "ಹುಡುಕಿ", mr: "शोधा", te: "వెతకండి" }],
  "search.placeholder": ["Search for \"Humic Acid\"", null, { hi: "\"ह्यूमिक एसिड\" खोजें", kn: "\"ಹ್ಯೂಮಿಕ್ ಆಸಿಡ್\" ಹುಡುಕಿ", mr: "\"ह्युमिक ॲसिड\" शोधा", te: "\"హ్యూమిక్ యాసిడ్\" కోసం వెతకండి" }],
  "search.label": ["Search products", "SearchProducts", { hi: "उत्पाद खोजें", kn: "ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ", mr: "उत्पादने शोधा", te: "ఉత్పత్తులను వెతకండి" }],
  "search.clear": ["Clear search", null, { hi: "खोज साफ़ करें", kn: "ಹುಡುಕಾಟ ತೆರವುಗೊಳಿಸಿ", mr: "शोध साफ करा", te: "శోధన క్లియర్ చేయండి" }],
  "search.searching": ["Searching…", "Searching...", { hi: "खोज रहे हैं…", kn: "ಹುಡುಕಲಾಗುತ್ತಿದೆ…", mr: "शोधत आहे…", te: "వెతుకుతోంది…" }],
  "search.noSuggestions": ["No suggestions for “{{q}}”.", null, { hi: "“{{q}}” के लिए कोई सुझाव नहीं।", kn: "“{{q}}” ಗೆ ಯಾವುದೇ ಸಲಹೆಗಳಿಲ್ಲ.", mr: "“{{q}}” साठी कोणत्याही सूचना नाहीत.", te: "“{{q}}” కోసం సూచనలు లేవు." }],
  "search.searchFor": ["Search for “{{q}}”", null, { hi: "“{{q}}” खोजें", kn: "“{{q}}” ಹುಡುಕಿ", mr: "“{{q}}” शोधा", te: "“{{q}}” కోసం వెతకండి" }],
  "search.startTyping": ["Start typing to search products.", "Start typing to search", { hi: "उत्पाद खोजने के लिए टाइप करना शुरू करें।", kn: "ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಲು ಟೈಪ್ ಮಾಡಲು ಪ್ರಾರಂಭಿಸಿ.", mr: "उत्पादने शोधण्यासाठी टाइप करायला सुरुवात करा.", te: "ఉత్పత్తులను వెతకడానికి టైప్ చేయడం ప్రారంభించండి." }],
  "search.recent": ["Recent searches", null, { hi: "हाल की खोजें", kn: "ಇತ್ತೀಚಿನ ಹುಡುಕಾಟಗಳು", mr: "अलीकडील शोध", te: "ఇటీవలి శోధనలు" }],
  "search.clearAll": ["Clear all", null, { hi: "सभी हटाएँ", kn: "ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ", mr: "सर्व साफ करा", te: "అన్నీ క్లియర్ చేయండి" }],
  "search.trending": ["Trending searches", null, { hi: "ट्रेंडिंग खोजें", kn: "ಟ್ರೆಂಡಿಂಗ್ ಹುಡುಕಾಟಗಳು", mr: "ट्रेंडिंग शोध", te: "ట్రెండింగ్ శోధనలు" }],
  "search.typeToSearch": ["Type something to search for products.", null, { hi: "उत्पाद खोजने के लिए कुछ टाइप करें।", kn: "ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಲು ಏನಾದರೂ ಟೈಪ್ ಮಾಡಿ.", mr: "उत्पादने शोधण्यासाठी काहीतरी टाइप करा.", te: "ఉత్పత్తులను వెతకడానికి ఏదైనా టైప్ చేయండి." }],
  "search.noResults": ["No products found for “{{q}}”.", null, { hi: "“{{q}}” के लिए कोई उत्पाद नहीं मिला।", kn: "“{{q}}” ಗೆ ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಸಿಗಲಿಲ್ಲ.", mr: "“{{q}}” साठी कोणतीही उत्पादने आढळली नाहीत.", te: "“{{q}}” కోసం ఉత్పత్తులు ఏవీ కనబడలేదు." }],
  "search.resultsFor": ["Search results for “{{q}}”", null, { hi: "“{{q}}” के खोज परिणाम", kn: "“{{q}}” ಗಾಗಿ ಹುಡುಕಾಟ ಫಲಿತಾಂಶಗಳು", mr: "“{{q}}” साठी शोध परिणाम", te: "“{{q}}” కోసం శోధన ఫలితాలు" }],
  "search.item": ["item", "item", { hi: "आइटम", kn: "ಐಟಂ", mr: "आयटम", te: "ఐటెమ్" }],
  "search.items": ["items", "items", { hi: "आइटम", kn: "ಐಟಂಗಳು", mr: "आयटम", te: "ఐటెమ్‌లు" }],

  // location
  "location.select": ["Select delivery location", null, { hi: "डिलीवरी स्थान चुनें", kn: "ಡೆಲಿವರಿ ಸ್ಥಳ ಆಯ್ಕೆಮಾಡಿ", mr: "डिलिव्हरी ठिकाण निवडा", te: "డెలివరీ స్థానాన్ని ఎంచుకోండి" }],
  "location.confirm": ["Confirm Location", "ConfirmLocation", { hi: "स्थान की पुष्टि करें", kn: "ಸ್ಥಳವನ್ನು ದೃಢೀಕರಿಸಿ", mr: "ठिकाणाची पुष्टी करा", te: "స్థానాన్ని నిర్ధారించండి" }],
  "location.why": ["We need your location to show available products.", null, { hi: "उपलब्ध उत्पाद दिखाने के लिए हमें आपका स्थान चाहिए।", kn: "ಲಭ್ಯವಿರುವ ಉತ್ಪನ್ನಗಳನ್ನು ತೋರಿಸಲು ನಮಗೆ ನಿಮ್ಮ ಸ್ಥಳ ಬೇಕು.", mr: "उपलब्ध उत्पादने दाखवण्यासाठी आम्हाला तुमचे ठिकाण हवे आहे.", te: "అందుబాటులో ఉన్న ఉత్పత్తులను చూపడానికి మాకు మీ స్థానం కావాలి." }],
  "location.useCurrent": ["Use Current Location", "Use Current Location", { hi: "वर्तमान स्थान का उपयोग करें", kn: "ಪ್ರಸ್ತುತ ಸ್ಥಳ ಬಳಸಿ", mr: "सध्याचे ठिकाण वापरा", te: "ప్రస్తుత స్థానాన్ని ఉపయోగించండి" }],
  "location.fetching": ["Fetching current location…", null, { hi: "वर्तमान स्थान प्राप्त कर रहे हैं…", kn: "ಪ್ರಸ್ತುತ ಸ್ಥಳ ಪಡೆಯಲಾಗುತ್ತಿದೆ…", mr: "सध्याचे ठिकाण मिळवत आहे…", te: "ప్రస్తుత స్థానాన్ని పొందుతోంది…" }],
  "location.orEnterPincode": ["or enter pincode", null, { hi: "या पिनकोड दर्ज करें", kn: "ಅಥವಾ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ", mr: "किंवा पिनकोड टाका", te: "లేదా పిన్‌కోడ్ నమోదు చేయండి" }],
  "location.pincodePlaceholder": ["Enter 6-Digit Pincode", "Enter 6-Digit Pincode", { hi: "6 अंकों का पिनकोड दर्ज करें", kn: "6-ಅಂಕಿಯ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ", mr: "6 अंकी पिनकोड टाका", te: "6 అంకెల పిన్‌కోడ్ నమోదు చేయండి" }],
  "location.updating": ["Updating location…", null, { hi: "स्थान अपडेट हो रहा है…", kn: "ಸ್ಥಳ ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ…", mr: "ठिकाण अपडेट होत आहे…", te: "స్థానం అప్‌డేట్ అవుతోంది…" }],
  "location.saved": ["Saved Addresses", null, { hi: "सहेजे गए पते", kn: "ಉಳಿಸಿದ ವಿಳಾಸಗಳು", mr: "जतन केलेले पत्ते", te: "సేవ్ చేసిన చిరునామాలు" }],
  "location.selected": ["Selected", null, { hi: "चयनित", kn: "ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ", mr: "निवडलेले", te: "ఎంచుకోబడింది" }],
  "location.errorGeneric": ["Something went wrong. Please try again.", null, { hi: "कुछ गलत हो गया। कृपया फिर से प्रयास करें।", kn: "ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", mr: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.", te: "ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి." }],
  "location.errorDigits": ["Only numbers are allowed", "Only numbers allowed", { hi: "केवल अंक मान्य हैं", kn: "ಸಂಖ್ಯೆಗಳು ಮಾತ್ರ ಅನುಮತಿಸಲಾಗಿದೆ", mr: "फक्त अंक चालतात", te: "సంఖ్యలు మాత్రమే అనుమతించబడతాయి" }],
  "location.errorPincode": ["Please enter a valid 6-digit pincode", null, { hi: "कृपया मान्य 6 अंकों का पिनकोड दर्ज करें", kn: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 6-ಅಂಕಿಯ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ", mr: "कृपया वैध 6 अंकी पिनकोड टाका", te: "దయచేసి సరైన 6 అంకెల పిన్‌కోడ్ నమోదు చేయండి" }],
  "location.errorUnsupported": ["Location is not supported in this browser.", null, { hi: "इस ब्राउज़र में स्थान समर्थित नहीं है।", kn: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಥಳ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.", mr: "या ब्राउझरमध्ये ठिकाण समर्थित नाही.", te: "ఈ బ్రౌజర్‌లో స్థానం సపోర్ట్ చేయబడదు." }],
  "location.errorNoPincode": ["Couldn't find a pincode for your location.", null, { hi: "आपके स्थान का पिनकोड नहीं मिला।", kn: "ನಿಮ್ಮ ಸ್ಥಳಕ್ಕೆ ಪಿನ್‌ಕೋಡ್ ಸಿಗಲಿಲ್ಲ.", mr: "तुमच्या ठिकाणाचा पिनकोड सापडला नाही.", te: "మీ స్థానానికి పిన్‌కోడ్ కనబడలేదు." }],
  "location.errorFailed": ["Failed to get location. Please try again.", null, { hi: "स्थान प्राप्त नहीं हो सका। कृपया फिर से प्रयास करें।", kn: "ಸ್ಥಳ ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", mr: "ठिकाण मिळाले नाही. कृपया पुन्हा प्रयत्न करा.", te: "స్థానాన్ని పొందడం విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి." }],
  "location.errorDenied": ["Location permission denied. Allow it in your browser, or enter a pincode.", null, { hi: "स्थान की अनुमति नहीं दी गई। ब्राउज़र में अनुमति दें या पिनकोड दर्ज करें।", kn: "ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಅನುಮತಿಸಿ ಅಥವಾ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ.", mr: "ठिकाणाची परवानगी नाकारली. ब्राउझरमध्ये परवानगी द्या किंवा पिनकोड टाका.", te: "స్థాన అనుమతి నిరాకరించబడింది. బ్రౌజర్‌లో అనుమతించండి లేదా పిన్‌కోడ్ నమోదు చేయండి." }],

  // product
  "product.details": ["Product Details", "Product Details", { hi: "उत्पाद विवरण", kn: "ಉತ್ಪನ್ನದ ವಿವರಗಳು", mr: "उत्पादन तपशील", te: "ఉత్పత్తి వివరాలు" }],
  "product.packSize": ["Pack size", null, { hi: "पैक का आकार", kn: "ಪ್ಯಾಕ್ ಗಾತ್ರ", mr: "पॅक आकार", te: "ప్యాక్ పరిమాణం" }],
  "product.notDeliverable": ["Not available for delivery to your location right now.", null, { hi: "अभी आपके स्थान पर डिलीवरी उपलब्ध नहीं है।", kn: "ಸದ್ಯಕ್ಕೆ ನಿಮ್ಮ ಸ್ಥಳಕ್ಕೆ ಡೆಲಿವರಿ ಲಭ್ಯವಿಲ್ಲ.", mr: "सध्या तुमच्या ठिकाणी डिलिव्हरी उपलब्ध नाही.", te: "ప్రస్తుతం మీ స్థానానికి డెలివరీ అందుబాటులో లేదు." }],
  "product.estimatedDelivery": ["Estimated delivery by {{date}}", null, { hi: "अनुमानित डिलीवरी {{date}} तक", kn: "ಅಂದಾಜು ಡೆಲಿವರಿ {{date}} ರೊಳಗೆ", mr: "अंदाजे डिलिव्हरी {{date}} पर्यंत", te: "అంచనా డెలివరీ {{date}} లోపు" }],
  "product.description": ["Description", null, { hi: "विवरण", kn: "ವಿವರಣೆ", mr: "वर्णन", te: "వివరణ" }],
  "product.applicationDosage": ["Application & Dosage", "Application Dosage", { hi: "उपयोग और मात्रा", kn: "ಬಳಕೆ ಮತ್ತು ಪ್ರಮಾಣ", mr: "वापर आणि मात्रा", te: "వినియోగం & మోతాదు" }],

  // cart
  "common.cancel": ["Cancel", "Cancel", {}],
  "cart.add": ["Add", "Add", {}],
  "cart.addToCart": ["Add to Cart", "AddtoCart", {}],
  "cart.buyNow": ["Buy Now", "BuyNow", {}],
  "cart.goToCart": ["Go To Cart", "GoToCart", {}],
  "cart.title": ["Your Cart", "YourCart", {}],
  "cart.empty": ["Your Cart is Empty", "Noitemsinthecart", {}],
  "cart.emptyDescription": ["It seems you haven't put anything in your cart yet", "emptyCartDescription", {}],
  "cart.startShopping": ["Start Shopping", "start_shopping", {}],
  "cart.items": ["Cart Items", "CartItems", {}],
  "cart.availableItems": ["Available Items", "AvailableItems", {}],
  "cart.outOfStockItems": ["Out Of Stock Items", "OutOfStockItems", {}],
  "cart.removeAll": ["Remove All", "RemoveAll", {}],
  "cart.someOutOfStock": ["{{outOfStockItemsCount}} items are out of stock and cannot be ordered right now.", "SomeOutOfStockItemsText", {}],
  "cart.allOutOfStock": ["All items are out of stock and cannot be ordered right now.", "AllOutOfStockItemsText", {}],
  "cart.youMightAlsoLike": ["You might also like", "cartYouMightAlsoLike", {}],
  "cart.itemAdded": ["Item added to the cart", "cartItemAdded", {}],
  "cart.deliveryBy": ["Delivery by <bold>{{month}} {{day}}</bold>", "deliveryBy", {}],
  "cart.deliveryToday": ["Delivery Today", "deliveryToday", {}],
  "cart.deliveryTomorrow": ["Delivery Tomorrow", "deliveryTomorrow", {}],
  "cart.daysDelivery": ["{{count}} Days Delivery", "daysDelivery", {}],
  "cart.orderSummary": ["Order Summary", "OrderSummary", {}],
  "cart.totalAmount": ["Total Amount", "TotalAmount", {}],
  "cart.choosePaymentMode": ["Choose Payment Mode", "ChoosePaymentMode", {}],
  "cart.removeConfirm": ["Are you sure you want to remove this item?", "confirmationText", {}],
  "cart.remove": ["Remove", "Remove", {}],
  "cart.unlockFreeDelivery": ["Unlock Free Delivery", "unlockFreeDelivery", {}],
  "cart.moreForFreeDelivery": ["Just ₹{{amount}} more for free delivery", "Additemsworth", {}],
  "cart.freeDeliveryApplied": ["You Got Free Delivery!", "freeDeliveryApplied", {}],
  "cart.enjoyShopping": ["Enjoy Shopping", "ContinueShoppingWithFreeDelivery", {}],
  "cart.availableStock": ["Available Stock", "Available Stock", {}],
  "cart.increase": ["Increase quantity", null, { hi: "मात्रा बढ़ाएँ", kn: "ಪ್ರಮಾಣ ಹೆಚ್ಚಿಸಿ", mr: "संख्या वाढवा", te: "పరిమాణం పెంచండి" }],
  "cart.decrease": ["Decrease quantity", null, { hi: "मात्रा घटाएँ", kn: "ಪ್ರಮಾಣ ಕಡಿಮೆ ಮಾಡಿ", mr: "संख्या कमी करा", te: "పరిమాణం తగ్గించండి" }],

  // checkout (RN CartPaymentPage / Checkout.js / OrderSuccessPage)
  "checkout.title": ["Payment Mode", "PaymentMode", {}],
  "checkout.stepCart": ["Cart", "Cart", {}],
  "checkout.stepPlaced": ["Order Placed", "OrderPlaced", {}],
  "checkout.selectMethod": ["Select Payment Method", "Select Payment Method", {}],
  "checkout.payOnline": ["Pay Online", "Pay Online", {}],
  "checkout.onlineDescription": ["UPI • Card • Net Banking..", "onlinePaymentDescription", {}],
  "checkout.recommended": ["RECOMMENDED", "RECOMMENDED", {}],
  "checkout.secure": ["100% Secure Payment", "secure", {}],
  "checkout.save": ["Save", "Save", {}],
  "checkout.cod": ["Cash On Delivery", "CashOnDelivery", {}],
  "checkout.codDescription": ["Pay when your order arrives", "orderArrives", {}],
  "checkout.codUnavailable": ["Cash on Delivery — not available for you", "CODNotUnavailable", {}],
  "checkout.codUnavailableHint": ["Pay online to place the order", "placeOrder", {}],
  "checkout.tapToKnowWhy": ["Tap to know why", "tap", {}],
  "checkout.codGotIt": ["Got it, I'll Pay Online", "PayOnline", {}],
  "checkout.payNow": ["Pay Now", "PayNow", {}],
  "checkout.placeOrder": ["Place Order", "PlaceOrder", {}],
  "checkout.deliverTo": ["Deliver To", "DeliverTo", {}],
  "checkout.notServiceable": ["Non Serviceable Area", "NonServiceableArea", {}],
  "checkout.notServiceableText": ["We currently do not deliver to this pincode. Please select a different delivery location to continue", "unServiceableText", {}],
  "checkout.noCancellation": ["Orders cannot be cancelled once placed", "CancellationNotAllowedTitle", {}],
  "checkout.holdOn": ["Hold on!", "holdOn", {}],
  "checkout.verifying": ["We are verifying your payment", "verifyingPaymentText", {}],
  "checkout.placing": ["Placing your order…", null, { hi: "आपका ऑर्डर किया जा रहा है…", kn: "ನಿಮ್ಮ ಆರ್ಡರ್ ಮಾಡಲಾಗುತ್ತಿದೆ…", mr: "तुमची ऑर्डर दिली जात आहे…", te: "మీ ఆర్డర్ చేయబడుతోంది…" }],
  "checkout.noAddress": ["Add a delivery address in the FarmsApp app to place an order.", null, { hi: "ऑर्डर करने के लिए FarmsApp ऐप में डिलीवरी पता जोड़ें।", kn: "ಆರ್ಡರ್ ಮಾಡಲು FarmsApp ಆ್ಯಪ್‌ನಲ್ಲಿ ಡೆಲಿವರಿ ವಿಳಾಸ ಸೇರಿಸಿ.", mr: "ऑर्डर देण्यासाठी FarmsApp ॲपमध्ये डिलिव्हरी पत्ता जोडा.", te: "ఆర్డర్ చేయడానికి FarmsApp యాప్‌లో డెలివరీ చిరునామా జోడించండి." }],
  "checkout.paymentCancelled": ["Payment was not completed. You can try again.", null, { hi: "भुगतान पूरा नहीं हुआ। आप फिर से प्रयास कर सकते हैं।", kn: "ಪಾವತಿ ಪೂರ್ಣಗೊಂಡಿಲ್ಲ. ನೀವು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಬಹುದು.", mr: "पेमेंट पूर्ण झाले नाही. तुम्ही पुन्हा प्रयत्न करू शकता.", te: "చెల్లింపు పూర్తి కాలేదు. మీరు మళ్ళీ ప్రయత్నించవచ్చు." }],
  "order.placedTitle": ["Order Placed Successfully!", "orderPlacedSuccessfully", {}],
  "order.paymentSuccessful": ["Payment Successful", "paymentSuccessful", {}],
  "order.expectedDelivery": ["Expected delivery", "expectedDelivery", {}],
  "order.deliveringTo": ["Delivering to", "deliveringTo", {}],
  "order.orderedItems": ["Ordered Items", "OrderedItems", {}],
  "order.total": ["Total", "Total", {}],
  "order.paymentStatus": ["Payment Status", "PaymentStatus", {}],
  "order.codUnpaid": ["Cash On Delivery • Unpaid", null, { hi: "कैश ऑन डिलीवरी • भुगतान बाकी", kn: "ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ • ಪಾವತಿ ಬಾಕಿ", mr: "कॅश ऑन डिलिव्हरी • पेमेंट बाकी", te: "క్యాష్ ఆన్ డెలివరీ • చెల్లింపు బాకీ" }],
  "order.onlinePaid": ["Online • Paid", null, { hi: "ऑनलाइन • भुगतान हो गया", kn: "ಆನ್‌ಲೈನ್ • ಪಾವತಿಸಲಾಗಿದೆ", mr: "ऑनलाइन • पेमेंट झाले", te: "ఆన్‌లైన్ • చెల్లించబడింది" }],
  "order.continueShopping": ["Continue Shopping", "continueShopping", {}],

  // notify me (RN components/Category/NotifyMe.js)
  "notify.button": ["Notify Me", "Notify Me", {}],
  "notify.done": ["Item out of stock. We'll notify you as soon as it's back.", "Item Out of stock We will notify you as soon as its back", {}],

  // auth (RN modules/auth: LoginForm, OtpContainer, PincodeSelectionScreen; ProfilePage logout)
  "auth.login": ["Login", null, { hi: "लॉगिन", kn: "ಲಾಗಿನ್", mr: "लॉगिन", te: "లాగిన్" }],
  "auth.loginToContinue": ["Log in to add items to your cart and place orders.", null, { hi: "कार्ट में सामान जोड़ने और ऑर्डर करने के लिए लॉगिन करें।", kn: "ಕಾರ್ಟ್‌ಗೆ ವಸ್ತುಗಳನ್ನು ಸೇರಿಸಲು ಮತ್ತು ಆರ್ಡರ್ ಮಾಡಲು ಲಾಗಿನ್ ಮಾಡಿ.", mr: "कार्टमध्ये वस्तू जोडण्यासाठी आणि ऑर्डर देण्यासाठी लॉगिन करा.", te: "కార్ట్‌కు వస్తువులు జోడించడానికి మరియు ఆర్డర్ చేయడానికి లాగిన్ చేయండి." }],
  "auth.enterMobileTitle": ["Enter your mobile number", "EnterYourMobileNumber", {}],
  "auth.otpDescription": ["We will send you the 4-Digit OTP with your entered mobile number", "OtpSendingDescription", {}],
  "auth.mobilePlaceholder": ["Enter Mobile Number", "EnterMobile", {}],
  "auth.getOtp": ["Get OTP", "GetOTP", {}],
  "auth.enterMobileError": ["Please enter mobile number", "Pleaseentermobilenumber", {}],
  "auth.invalidMobile": ["Enter a valid 10-digit mobile number", null, { hi: "सही 10 अंकों का मोबाइल नंबर दर्ज करें", kn: "ಸರಿಯಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ", mr: "योग्य 10 अंकी मोबाइल नंबर टाका", te: "సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి" }],
  "auth.otpSent": ["OTP has been sent successfully", "OTPSuccessToaster", {}],
  "auth.otpTitle": ["OTP Verification", "OtpVerification", {}],
  "auth.enterOtp": ["Enter the OTP", "EnterTheOtp", {}],
  "auth.otpSentTo": ["Enter the 4-Digit OTP sent to your registered mobile number", "otpSentToRegistered", {}],
  "auth.otpNotReceived": ["Didn’t receive the OTP?", "otpNotReceived", {}],
  "auth.resend": ["Resend OTP", "ResendOtpLink", {}],
  "auth.change": ["Change", "Change", {}],
  "auth.verifying": ["Verifying…", null, { hi: "जाँच हो रही है…", kn: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…", mr: "पडताळणी होत आहे…", te: "ధృవీకరిస్తోంది…" }],
  "auth.pincodeTitle": ["For delivery & product availability", "For delivery & product availability", {}],
  "auth.pincodeManual": ["Enter Pincode Manually", "Enter Pincode Manually", {}],
  "auth.check": ["Check", "Check", {}],
  "auth.whyLocation": ["Why do we need your location?", "WhyLocation?", {}],
  "auth.locationDisclaimer": ["We use your location to show products available for delivery in your area and provide accurate delivery estimates.", "locationDisclaimer", {}],
  "auth.or": ["OR", "OR", {}],
  "auth.logout": ["Logout", "Logout", {}],
  "auth.logoutConfirm": ["Are you sure you want to logout?", "LogoutConfirmation", {}],

  // address (RN DeliveryAddressView, SelectAddress, AddressDetailsScreen, CartFooter)
  "address.addDetails": ["Add delivery details to continue", "AddressNotFound", {}],
  "address.add": ["Add Address", "AddAddress", {}],
  "address.addDelivery": ["Add Delivery Address", "AddDeliveryAddress", {}],
  "address.changeDelivery": ["Change Delivery Address", "Changedeliveryaddress", {}],
  "address.mine": ["My Addresses", "myAddresses", {}],
  "address.edit": ["Edit", "Edit", {}],
  "address.delete": ["Delete", "Delete", {}],
  "address.noneSaved": ["No saved addresses", "NoSavedAddress", {}],
  "address.noneSavedText": ["It looks like you haven't added a shipping address yet!", "noAddressFoundDescription", {}],
  "address.addNew": ["Add New Address", "Add New Address", {}],
  "address.editTitle": ["Edit Address", "Edit Address", {}],
  "address.newTitle": ["New Address", "New Address", {}],
  "address.save": ["Save Address", "saveAddress", {}],
  "address.accurateInfo": ["An accurate address means your order arrives the first time", "addressDetailInfoText", {}],
  "address.selectState": ["Select State", "SelectState", {}],
  "address.statesFailed": ["Unable to load states. Please try again.", "UnableToLoadStates", {}],
  "address.retry": ["Retry", "Retry", {}],
  "address.onlyLetters": ["Only letters are allowed", "Only letters are allowed", {}],
  "address.mobile": ["Mobile Number", "MobileNumber", {}],
  "address.deleteConfirm": ["Delete this address?", null, { hi: "क्या यह पता हटाना है?", kn: "ಈ ವಿಳಾಸವನ್ನು ಅಳಿಸಬೇಕೆ?", mr: "हा पत्ता हटवायचा का?", te: "ఈ చిరునామాను తొలగించాలా?" }],
  "address.added": ["Address added successfully", null, { hi: "पता सफलतापूर्वक जोड़ा गया", kn: "ವಿಳಾಸವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ", mr: "पत्ता यशस्वीरित्या जोडला", te: "చిరునామా విజయవంతంగా జోడించబడింది" }],
  "address.updated": ["Address updated successfully", null, { hi: "पता सफलतापूर्वक बदला गया", kn: "ವಿಳಾಸವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ", mr: "पत्ता यशस्वीरित्या बदलला", te: "చిరునామా విజయవంతంగా నవీకరించబడింది" }],
  "address.deleted": ["Address deleted successfully", null, { hi: "पता सफलतापूर्वक हटाया गया", kn: "ವಿಳಾಸವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ", mr: "पत्ता यशस्वीरित्या हटवला", te: "చిరునామా విజయవంతంగా తొలగించబడింది" }],
  "address.invalidPincode": ["Invalid Pincode", null, { hi: "अमान्य पिनकोड", kn: "ಅಮಾನ್ಯ ಪಿನ್‌ಕೋಡ್", mr: "अवैध पिनकोड", te: "చెల్లని పిన్‌కోడ్" }],

  // orders (RN OrderPage, OrderProductPage, OrderSuccessPage)
  "orders.count": ["orders", "orders", {}],
  "orders.all": ["All", "All", {}],
  "orders.inTransit": ["In Transit", "In Transit", {}],
  "orders.delivered": ["Delivered", "Delivered", {}],
  "orders.cancelled": ["Cancelled", "Cancelled", {}],
  "orders.viewDetails": ["View Details", "ViewDetails", {}],
  "orders.hideDetails": ["Hide Details", null, { hi: "विवरण छिपाएँ", kn: "ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ", mr: "तपशील लपवा", te: "వివరాలు దాచండి" }],
  "orders.empty": ["No Order Found!", "No Purchase History", {}],
  "orders.details": ["Order Details", "OrderDetails", {}],
  "orders.orderId": ["Order ID", "OrderID", {}],
  "orders.shippedInPackages": ["Your order has been shipped in {{packageCount}} packages", "OrderShippedInPackage", {}],
  "orders.packagesNote": ["Each package has separate tracking. Track them individually below", "OrderShippedInPackageDescription", {}],
  "orders.packageOf": ["Package {{current}} of {{total}}", "PackageInfo", {}],
  "orders.package": ["Package", "Package", {}],
  "orders.deliveredOn": ["Delivered On", null, { hi: "डिलीवरी की तारीख", kn: "ವಿತರಿಸಿದ ದಿನಾಂಕ", mr: "डिलिव्हरीची तारीख", te: "డెలివరీ అయిన తేదీ" }],
  "orders.refundInitiatedOn": ["Refund Initiated On", null, { hi: "रिफंड शुरू होने की तारीख", kn: "ಮರುಪಾವತಿ ಪ್ರಾರಂಭಿಸಿದ ದಿನಾಂಕ", mr: "परतावा सुरू झाल्याची तारीख", te: "రిఫండ్ ప్రారంభించిన తేదీ" }],
  "orders.refundedOn": ["Refunded On", null, { hi: "रिफंड की तारीख", kn: "ಮರುಪಾವತಿ ದಿನಾಂಕ", mr: "परतावा दिल्याची तारीख", te: "రిఫండ్ చేసిన తేదీ" }],
  "orders.returnedOn": ["Returned to origin on", null, { hi: "वापस भेजे जाने की तारीख", kn: "ಹಿಂತಿರುಗಿಸಿದ ದಿನಾಂಕ", mr: "परत पाठवल्याची तारीख", te: "తిరిగి పంపిన తేదీ" }],
  "orders.cancelledOn": ["Cancelled on", null, { hi: "रद्द होने की तारीख", kn: "ರದ್ದಾದ ದಿನಾಂಕ", mr: "रद्द झाल्याची तारीख", te: "రద్దయిన తేదీ" }],
  "orders.expectedDate": ["Expected Delivery Date", null, { hi: "अनुमानित डिलीवरी तारीख", kn: "ಅಂದಾಜು ವಿತರಣಾ ದಿನಾಂಕ", mr: "अपेक्षित डिलिव्हरी तारीख", te: "అంచనా డెలివరీ తేదీ" }],
  "orders.trackingId": ["Tracking ID", null, { hi: "ट्रैकिंग आईडी", kn: "ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿ", mr: "ट्रॅकिंग आयडी", te: "ట్రాకింగ్ ఐడి" }],
  "orders.courier": ["Courier Partner", null, { hi: "कूरियर पार्टनर", kn: "ಕೊರಿಯರ್ ಪಾಲುದಾರ", mr: "कुरिअर पार्टनर", te: "కొరియర్ భాగస్వామి" }],
  "orders.paid": ["Paid", "Paid", {}],
  "orders.unpaid": ["Unpaid", null, { hi: "भुगतान बाकी", kn: "ಪಾವತಿ ಬಾಕಿ", mr: "पेमेंट बाकी", te: "చెల్లింపు బాకీ" }],
  "orders.cod": ["COD", "COD", { mr: "सीओडी" }],
  "orders.online": ["Online", "Online", {}],
  "orders.deliveryBy": ["Delivery by <bold>{{date}}</bold>", "deliveryByDate", {}],
  "orders.confirmed": ["CONFIRMED", "confirmed", {}],
  "orders.orderCancelled": ["Order Cancelled", "orderCancelled", {}],
  "orders.cancelledBadge": ["CANCELLED", null, { hi: "रद्द", kn: "ರದ್ದು", mr: "रद्द", te: "రద్దు" }],
  "orders.deliveryDetails": ["Delivery Details", "DeliveryDetails", {}],
  "orders.shippingAddress": ["Shipping Address", "ShippingAddress", {}],
  "orders.downloadInvoice": ["Download Invoice", "DownloadInvoice", {}],
  "orders.invoiceSoon": ["Invoice will be available shortly", "invoiceText", {}],
  "orders.placedAt": ["Order Placed at", "OrderPlacedAt", {}],
  "orders.notFound": ["No Order Detail", "NoOrderDetail", {}],
  "orders.refundInfo": ["Refund Information", null, { hi: "रिफंड की जानकारी", kn: "ಮರುಪಾವತಿ ಮಾಹಿತಿ", mr: "परताव्याची माहिती", te: "రిఫండ్ సమాచారం" }],
  "orders.refundAmount": ["Refund Amount", null, { hi: "रिफंड राशि", kn: "ಮರುಪಾವತಿ ಮೊತ್ತ", mr: "परतावा रक्कम", te: "రిఫండ్ మొత్తం" }],
  "orders.refundNote": ["Your refund has been processed. It may take up to 7 business days to show in your account.", "RefundDisclaimer", {}],
  "orders.trackYourOrder": ["Track your order", "trackYourOrder", {}],
  "orders.clickToTrack": ["Click here to track the order", "clickHereToTrack", {}],
  "orders.goToDetails": ["Go to order details", "goToOrderDetails", {}],

  // profile (RN ProfilePage, ProfileCard, PersonalInfo)
  "profile.fallbackName": ["Farmsapp Farmer", null, { hi: "Farmsapp किसान", kn: "Farmsapp ರೈತ", mr: "Farmsapp शेतकरी", te: "Farmsapp రైతు" }],
  "profile.edit": ["Edit", "Edit", {}],
  "profile.editTitle": ["Edit Profile", "EditProfile", {}],
  "profile.changeLanguage": ["Change Language", "ChangeLanguage", {}],
  "profile.account": ["Account Management", "Account Management", {}],
  "profile.help": ["Help & Support", "Help & Support", {}],
  "profile.fullName": ["Full Name", "FullName", {}],
  "profile.enterFullName": ["Enter Full Name", "EnterFullName", {}],
  "profile.enterName": ["Please Enter Name", "Pleaseentername", {}],
  "profile.numberFixed": ["You can't change the Mobile Number", "numberChangeText", {}],
  "profile.numberReason": ["For security reasons, changes to your mobile number must be made through customer support. Please contact us for assistance.", "reasons", {}],
  "profile.save": ["Save Profile", "Save Profile", {}],
  "profile.saved": ["User Details Updated Successfully", "UserDetailsUpdatedSuccessfully", {}],
  "profile.unsaved": ["Unsaved Changes", "Unsaved Changes", {}],
  "profile.unsavedText": ["You have unsaved changes. Are you sure you want to discard them?", "areYouSure", {}],
  "profile.discard": ["Discard", "Discard", {}],
  // contact (RN ContactUsPage)
  "contact.title": ["Contact Us", "ContactUs", {}],
  "contact.subtitle": ["Get help and support", "GetHelpAndSupport", {}],
  "contact.support": ["Customer Support", "Customer Support", {}],
  "contact.hours": ["Available Monday–Saturday, 10AM to 6PM", "AvailabilityTime", {}],
  "contact.email": ["Email ID", "EmailID", {}],
  "contact.sendEmail": ["Send Email", "SendEmail", {}],
  "contact.whatsapp": ["Whatsapp Support", "WhatsappSupport", {}],
  "contact.sendMessage": ["Send Message", "SendMessage", {}],
  // queries (RN CommonQueryDisplay)
  "query.title": ["Post Query", "PostQuery", {}],
  "query.list": ["Queries", "Queries", {}],
  "query.placeholder": ["Enter your query...", "Enteryourquery", {}],
  "query.none": ["No Queries Posted", "NoQueries", {}],
  "query.saved": ["Query saved successfully", "successQuery", {}],
  "query.empty": ["Query should not be null or empty", "nullQuery", {}],
  "query.submit": ["Submit", "Submit", {}],
  // product enquiry (RN ProductEnquiryPage, components/Category/ProductEnquiry)
  "enquiry.title": ["Product Enquiry", "ProductEnquiry", {}],
  "enquiry.productName": ["Enter Product Name", "EnterProductName", {}],
  "enquiry.moleculeName": ["Enter Molecule Name", "EnterMoleculeName", {}],
  "enquiry.description": ["Product Description", "productDescription", {}],
  "enquiry.addPhotos": ["Add Photos", "Add Photos", {}],
  "enquiry.upload": ["Upload Image", "Upload Image", {}],
  "enquiry.oneRequired": ["Enter a product name or a molecule name", null, { hi: "उत्पाद का नाम या अणु का नाम दर्ज करें", kn: "ಉತ್ಪನ್ನದ ಹೆಸರು ಅಥವಾ ಅಣು ಹೆಸರು ನಮೂದಿಸಿ", mr: "उत्पादनाचे नाव किंवा अणूचे नाव प्रविष्ट करा", te: "ఉత్పత్తి పేరు లేదా మాలిక్యూల్ పేరు నమోదు చేయండి" }],
  "enquiry.max3": ["Maximum 3 images allowed", null, { hi: "अधिकतम 3 फ़ोटो जोड़ी जा सकती हैं", kn: "ಗರಿಷ್ಠ 3 ಚಿತ್ರಗಳನ್ನು ಮಾತ್ರ ಸೇರಿಸಬಹುದು", mr: "जास्तीत जास्त 3 फोटो जोडता येतात", te: "గరిష్టంగా 3 చిత్రాలు మాత్రమే జోడించవచ్చు" }],
  "enquiry.tooBig": ["Images must be smaller than 5MB.", null, { hi: "फ़ोटो 5MB से छोटी होनी चाहिए।", kn: "ಚಿತ್ರಗಳು 5MB ಗಿಂತ ಚಿಕ್ಕದಾಗಿರಬೇಕು.", mr: "फोटो 5MB पेक्षा लहान असावेत.", te: "చిత్రాలు 5MB కంటే చిన్నవిగా ఉండాలి." }],
  "enquiry.failed": ["Request failed. Please try again.", null, { hi: "अनुरोध विफल रहा। कृपया फिर से प्रयास करें।", kn: "ವಿನಂತಿ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", mr: "विनंती अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.", te: "అభ్యర్థన విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి." }],
  "enquiry.thanks": ["Thanks for Sharing!", "ThanksForSharing", {}],
  "enquiry.valuable": ["Your input is valuable to us", "yourValuableInput", {}],
  "enquiry.successText": ["Our agri experts will review your enquiry and get back to you within 24 hours with product details and pricing", "productEnquirySuccessMessage", {}],
  "enquiry.notFound": ["Can't find what you're looking for?", "notFoundText", {}],
  "enquiry.letUsKnow": ["Please let us know about your required product by tapping the button below", "letUsKnow", {}],
  "enquiry.request": ["Request Product", "Request Product", {}],
  // crop doctor (RN pages/CropDoctor, SelectCropsPage, VideoCallAvailability, FeedbackScreen, ViewPrescription, CallHistory)
  "doctor.title": ["Crop Doctor", "CropDoctor", {}],
  "doctor.callOur": ["Call Our Crop Doctor", "CallCropDoctorTime", {}],
  "doctor.videoCallNow": ["Video Call Now", "VideoCallNow", {}],
  "doctor.tollFree": ["Toll-Free Number", "toll-free", {}],
  "doctor.busy": ["Currently all our Crop Doctors are busy, please try again later.", null, { hi: "वर्तमान में हमारे सभी फसल डॉक्टर व्यस्त हैं, कृपया बाद में पुनः प्रयास करें।", kn: "ಪ್ರಸ್ತುತ ನಮ್ಮ ಎಲ್ಲಾ ಬೆಳೆ ವೈದ್ಯರು ಕಾರ್ಯನಿರತರಾಗಿದ್ದಾರೆ, ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", mr: "सध्या आमचे सर्व पीक डॉक्टर व्यस्त आहेत, कृपया नंतर पुन्हा प्रयत्न करा.", te: "ప్రస్తుతం మా క్రాప్ డాక్టర్లు అందరూ బిజీగా ఉన్నారు, దయచేసి కొంతసేపటి తర్వాత మళ్లీ ప్రయత్నించండి." }],
  "doctor.selectCrops": ["Select Your Crops", "SelectYourCrops", {}],
  "doctor.selectedCrops": ["Selected Crops", "SelectedCrops", {}],
  "doctor.recentCrops": ["Recent Crops", "RecentCrops", {}],
  "doctor.crops": ["Crops", "Crops", {}],
  "doctor.cropLimit": ["Only three crops can be Selected", "CropSelectionLimit", {}],
  "doctor.chooseLanguage": ["Choose Call Language", "Choose Call Language", {}],
  "doctor.callWillBe": ["Call will be in {{language}}", null, { hi: "कॉल {{language}} में होगी", kn: "ಕರೆ {{language}} ನಲ್ಲಿ ಇರುತ್ತದೆ", mr: "कॉल {{language}} मध्ये होईल", te: "కాల్ {{language}}లో ఉంటుంది" }],
  "doctor.expertWill": ["Our crop expert will discuss recommendations for your selected crops", null, { hi: "हमारे फसल विशेषज्ञ आपकी चुनी हुई फसलों के लिए सुझाव देंगे", kn: "ನಮ್ಮ ಬೆಳೆ ತಜ್ಞರು ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಬೆಳೆಗಳಿಗೆ ಶಿಫಾರಸುಗಳನ್ನು ಚರ್ಚಿಸುತ್ತಾರೆ", mr: "आमचे पीक तज्ञ तुमच्या निवडलेल्या पिकांसाठी शिफारसी सांगतील", te: "మా పంట నిపుణులు మీరు ఎంచుకున్న పంటలకు సూచనలు చెబుతారు" }],
  "doctor.proceed": ["Proceed To Call", null, { hi: "कॉल पर आगे बढ़ें", kn: "ಕರೆಗೆ ಮುಂದುವರಿಯಿರಿ", mr: "कॉलसाठी पुढे जा", te: "కాల్‌కు కొనసాగండి" }],
  "doctor.pleaseWait": ["Please wait while we connect you to next available Crop Doctor", "PleaseWait", {}],
  "doctor.inCall": ["Your video call is open in a new tab. Allow camera and microphone when asked.", null, { hi: "आपकी वीडियो कॉल नए टैब में खुली है। पूछे जाने पर कैमरा और माइक्रोफ़ोन की अनुमति दें।", kn: "ನಿಮ್ಮ ವೀಡಿಯೊ ಕರೆ ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆದಿದೆ. ಕೇಳಿದಾಗ ಕ್ಯಾಮೆರಾ ಮತ್ತು ಮೈಕ್ರೊಫೋನ್‌ಗೆ ಅನುಮತಿ ನೀಡಿ.", mr: "तुमचा व्हिडिओ कॉल नवीन टॅबमध्ये उघडला आहे. विचारल्यावर कॅमेरा आणि मायक्रोफोनला परवानगी द्या.", te: "మీ వీడియో కాల్ కొత్త ట్యాబ్‌లో తెరవబడింది. అడిగినప్పుడు కెమెరా మరియు మైక్రోఫోన్‌కు అనుమతి ఇవ్వండి." }],
  "doctor.reopenCall": ["Open the call again", null, { hi: "कॉल फिर से खोलें", kn: "ಕರೆಯನ್ನು ಮತ್ತೆ ತೆರೆಯಿರಿ", mr: "कॉल पुन्हा उघडा", te: "కాల్‌ను మళ్ళీ తెరవండి" }],
  "doctor.callEnded": ["I've finished the call", null, { hi: "मेरी कॉल पूरी हो गई", kn: "ನನ್ನ ಕರೆ ಮುಗಿದಿದೆ", mr: "माझा कॉल संपला", te: "నా కాల్ పూర్తయింది" }],
  "doctor.history": ["Call History", "CallHistory", {}],
  "doctor.date": ["Date", "Date", {}],
  "doctor.resolved": ["Issue Resolved", "IssueResolved", {}],
  "doctor.yes": ["Yes", "Yes", {}],
  "doctor.no": ["No", "No", {}],
  "doctor.viewMore": ["View More", "ViewMore", {}],
  "doctor.comments": ["Comments", "Comments", {}],
  "doctor.noHistory": ["No Call History", "NoCallHistory", {}],
  "doctor.noExpert": ["No Expert Available. Please try again!", "NoExpertAvaliable", {}],
  "doctor.resolvedQ": ["Is your Issue resolved?", "Isyourissueresolved", {}],
  "doctor.feedback": ["Please enter your feedback", "Pleaseenteryourfeedback", {}],
  "doctor.thanks": ["Thank You For Calling", "ThankYouForCalling", {}],
  "doctor.hereIs": ["Here is the prescription for your problem", "HereIsPrescription", {}],
  "doctor.viewPrescription": ["View Prescription", "ViewPrescription", {}],
  "doctor.goToDoctor": ["Go To Crop Doctor", "GoToCropDoctor", {}],
  "doctor.company": ["Zuari FarmHub Limited", "ZuariFarmHubLimited", {}],
  "doctor.prescription": ["Crop Care Prescription", "CropCarePrescription", {}],
  "doctor.pickLanguage": ["Select Your Language", "LanguagesOffered", {}],
  "doctor.cropName": ["Crop Name", "CropName", {}],
  "doctor.auditDate": ["Audit Date", "AuditDate", {}],
  "doctor.goHome": ["Go to Homepage", "GoToHomepage", {}],
};

// Review pass (2026-10-22), applied on top of E.
//  app:   switch which farmsapp key is reused (null = stop reusing it)
//  tr:    replace my own translations
//  force: beat farmsapp's value for that language (bugs/typos in the app's locale files)
const REVIEW = {
  // farmsapp bugs
  "common.next": { force: { hi: "आगे" } }, // app hi says "लॉग इन करें" (Log in)
  "common.outOfStock": { force: { hi: "स्टॉक खत्म" } }, // app hi typo "अस्टॉक खत्म"
  "common.profile": { force: { kn: "ಪ್ರೊಫೈಲ್" } }, // app kn "ವ್ಯಕ್ತಿ ಚಿತ್ರ" = "person picture"
  "browse.allCrops": { app: "All Crops" }, // "AllCrops" has mr "सर्व पिक" / te "అన్నీ పంటలు" (ungrammatical)
  "search.label": { force: { mr: "उत्पादने शोधा" } }, // app mr uses Hindi "उत्पाद"
  "search.startTyping": { force: { kn: "ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಲು ಟೈಪ್ ಮಾಡಲು ಪ್ರಾರಂಭಿಸಿ." } }, // app kn = "is being typed"
  "product.applicationDosage": { app: null }, // app mr "अर्ज डोस" — "अर्ज" is a form/petition
  // item/items: the app pairs don't match each other (वस्तु/सामान, ಐಟಂ/ವಸ್ತುಗಳು, అంశం = topic)
  "search.item": { app: null, tr: { hi: "आइटम", kn: "ಐಟಂ", mr: "वस्तू", te: "వస్తువు" } },
  "search.items": { app: null, tr: { hi: "आइटम", kn: "ಐಟಂಗಳು", mr: "वस्तू", te: "వస్తువులు" } },

  "cart.availableStock": { force: { hi: "उपलब्ध स्टॉक" } }, // app hi "उपलब्ध शेयर" = stock-market shares
  "cart.removeConfirm": { force: { kn: "ಈ ಐಟಂ ಅನ್ನು ತೆಗೆದುಹಾಕಲು ಖಚಿತವೇ?" } }, // app kn "ನಿರ್ಗಮಿಸಲು" = to exit
  "cart.orderSummary": { force: { hi: "ऑर्डर सारांश" } }, // app hi "आदेश" = a command
  "cart.title": { force: { mr: "तुमची कार्ट" } }, // app mr "खरेदी पिशवी" (shopping bag); everything else says कार्ट
  "cart.empty": { force: { hi: "आपकी कार्ट खाली है", mr: "तुमची कार्ट रिकामी आहे" } }, // hi टोकरी vs कार्ट; mr "तुमची (कार्ट)खरेदी पिशवी रिकामी आहे"
  "cart.emptyDescription": { force: { hi: "लगता है आपने अभी तक अपनी कार्ट में कुछ नहीं डाला है", mr: "असे दिसते की तुम्ही अजून कार्टमध्ये काहीही ठेवलेले नाही" } }, // hi टोकरी vs कार्ट; mr double space

  "checkout.save": { force: { hi: "बचाएँ", mr: "बचत करा", te: "ఆదా చేయండి" } }, // app hi/te = save a file
  "checkout.holdOn": { force: { hi: "कृपया रुकें!", kn: "ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ!", mr: "कृपया थांबा!" } }, // app hi/kn/mr are curt commands
  "checkout.stepPlaced": { force: { hi: "ऑर्डर हो गया", kn: "ಆರ್ಡರ್ ಮಾಡಲಾಗಿದೆ" } }, // app hi "आदेश रखा गया" = command placed
  "checkout.placeOrder": { tr: { mr: "ऑर्डर करा" } }, // missing in app mr
  "checkout.deliverTo": { force: { mr: "डिलिव्हरी पत्ता" } }, // app mr "डिलिव्हरी करा" = "do delivery"
  "checkout.codUnavailableHint": { force: { hi: "ऑर्डर करने के लिए ऑनलाइन भुगतान करें", kn: "ಆರ್ಡರ್ ಮಾಡಲು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಪಾವತಿಸಿ", mr: "ऑर्डर देण्यासाठी ऑनलाइन पेमेंट करा", te: "ఆర్డర్ చేయడానికి ఆన్‌లైన్‌లో చెల్లించండి" } }, // app values end in a stray space

  "notify.done": { force: { mr: "आयटम स्टॉकमध्ये नाही. तो पुन्हा उपलब्ध होताच आम्ही तुम्हाला कळवू." } }, // app mr: "not in production", garbled

  "auth.otpSent": { force: { hi: "OTP सफलतापूर्वक भेज दिया गया है" } }, // app hi "OTP को ... भेजा गया है" reads oddly
  "auth.whyLocation": { force: { mr: "आम्हाला तुमचे स्थान का हवे आहे?" } }, // mr uses स्थान elsewhere

  "address.edit": { force: { hi: "बदलें", mr: "बदला" } }, // app hi "संपादन करना" = "to edit"; mr "सुधारा/ बदला"
  "address.changeDelivery": { force: { hi: "डिलीवरी पता बदलें" } }, // app hi dropped "delivery"
  "address.noneSavedText": { force: { kn: "ನೀವು ಇನ್ನೂ ಶಿಪ್ಪಿಂಗ್ ವಿಳಾಸವನ್ನು ಸೇರಿಸಿಲ್ಲ ಎಂದು ತೋರುತ್ತದೆ!", mr: "असे दिसते की तुम्ही अजून शिपिंग पत्ता जोडलेला नाही!" } }, // app kn "looking at you…"; mr garbled order
  "address.mobile": { force: { kn: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ" } }, // app kn "ದೂರವಾಣಿ" = telephone

  "orders.inTransit": { force: { kn: "ಸಾಗಣೆಯಲ್ಲಿದೆ", mr: "वाटेत आहे" } }, // app kn "ಪ್ರವಾಸದಲ್ಲಿದೆ" = on a trip; mr "प्रवासात" = travelling
  "orders.delivered": { force: { hi: "डिलीवर हो गया" } }, // app hi "पहुंचा दिया गया" is clumsy
  "orders.orderId": { force: { hi: "ऑर्डर आईडी" } }, // app hi "आदेश संख्या" = command number
  "orders.empty": { force: { hi: "कोई ऑर्डर नहीं मिला!", te: "ఆర్డర్ ఏదీ కనబడలేదు!" } }, // app hi/te say "no purchase history"
  "orders.paid": { force: { hi: "भुगतान हो गया", kn: "ಪಾವತಿಸಲಾಗಿದೆ", mr: "पेमेंट झाले" } }, // app hi "पेड" transliteration; kn adjective
  "orders.downloadInvoice": { force: { hi: "इनवॉइस डाउनलोड करें", kn: "ಇನ್‌ವಾಯ್ಸ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ", mr: "इनव्हॉइस डाउनलोड करा" } }, // app mr "चलन" = currency; kn word order
  "orders.invoiceSoon": { force: { hi: "इनवॉइस जल्द ही उपलब्ध होगा", mr: "इनव्हॉइस लवकरच उपलब्ध होईल" } },

  "profile.editTitle": { force: { kn: "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ" } }, // app kn = "you can edit your details"
  "profile.saved": { force: { hi: "विवरण सफलतापूर्वक अपडेट किए गए", mr: "तपशील यशस्वीरित्या अपडेट झाले" } }, // app hi/mr "farmer data updated"
  "profile.discard": { force: { hi: "हटा दें", mr: "सोडून द्या" } }, // app hi/mr = same word as Cancel
  "query.list": { force: { hi: "प्रश्न", mr: "प्रश्न" } }, // app: transliterated "क्वेरीज़"
  "query.saved": { force: { hi: "प्रश्न सफलतापूर्वक भेजा गया", mr: "प्रश्न यशस्वीरित्या पाठवला" } },
  "query.empty": { force: { hi: "प्रश्न खाली नहीं हो सकता", mr: "प्रश्न रिकामा असू शकत नाही" } }, // app hi "शून्य" = zero
  "query.none": { force: { mr: "कोणतेही प्रश्न पोस्ट केलेले नाहीत" } }, // app mr ungrammatical
  "enquiry.upload": { force: { hi: "फ़ोटो अपलोड करें" } },
  "doctor.selectCrops": { force: { mr: "आपली पिके निवडा" } }, // app mr singular "पिक"
  "doctor.selectedCrops": { force: { mr: "निवडलेली पिके" } },
  "doctor.crops": { force: { mr: "पिके" } },
  "doctor.cropLimit": { force: { mr: "केवळ तीन पिके निवडता येतात" } },
  "doctor.chooseLanguage": { force: { kn: "ಕರೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ" } }, // app kn = "choose your language"
  "doctor.goToDoctor": { force: { hi: "क्रॉप डॉक्टर पर जाएं", mr: "पीक डॉक्टरकडे जा" } }, // app mr "शेतीविदांना जा"
  "doctor.resolved": { force: { hi: "समस्या हल हुई" } }, // app hi gender mismatch
  "doctor.noExpert": { force: {} },

  // reuse the app's wording where it has the same string
  "home.bestSelling": { app: "Best Selling Products" },
  "browse.bestSellingTitle": { app: "Best Selling Products" },
  "common.noProducts": { app: "No products found" },
  "common.viewCart": { app: "View Cart" },
  "common.tryAgain": { app: "Retry" },
  "search.recent": { app: "RecentSearches" },
  "search.trending": { app: "TrendingSearches" },
  "search.clearAll": { app: "ClearAll", force: { te: "అన్నీ తొలగించండి" } }, // app te is the informal "తొలగించు"
  "location.fetching": { app: "FetchingCurrentLocation" },
  "location.errorPincode": { app: "Please enter a valid 6-digit pincode", force: { mr: "कृपया योग्य 6-अंकी पिनकोड टाका" } }, // app mr uses "६"; placeholder uses "6"

  // match the app's vocabulary: kn "ಕಂಡುಬಂದಿಲ್ಲ", mr "सापडले" + "स्थान", te "కనుగొనబడలేదు"
  "common.pageNotFound": { tr: { kn: "ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ", mr: "पेज सापडले नाही", te: "పేజీ కనుగొనబడలేదు" } },
  "browse.noCategories": { tr: { kn: "ಯಾವುದೇ ವರ್ಗಗಳು ಕಂಡುಬಂದಿಲ್ಲ.", mr: "कोणतीही श्रेणी सापडली नाही.", te: "వర్గాలు ఏవీ కనుగొనబడలేదు." } },
  "browse.noCrops": { tr: { kn: "ಯಾವುದೇ ಬೆಳೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.", mr: "कोणतीही पिके सापडली नाहीत.", te: "పంటలు ఏవీ కనుగొనబడలేదు." } },
  "browse.noCropProducts": { tr: { kn: "ಈ ಬೆಳೆಗೆ ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ.", mr: "या पिकासाठी कोणतीही उत्पादने सापडली नाहीत.", te: "ఈ పంటకు ఉత్పత్తులు ఏవీ కనుగొనబడలేదు." } },
  "search.noResults": { tr: { kn: "“{{q}}” ಗೆ ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ.", mr: "“{{q}}” साठी कोणतीही उत्पादने सापडली नाहीत.", te: "“{{q}}” కోసం ఉత్పత్తులు ఏవీ కనుగొనబడలేదు." } },
  "search.searchFor": { tr: { te: "“{{q}}” కోసం శోధించండి" } },
  "search.placeholder": { tr: { te: "\"హ్యూమిక్ యాసిడ్\" కోసం శోధించండి" } },
  "location.select": { tr: { mr: "डिलिव्हरी स्थान निवडा" } },
  "location.why": { tr: { mr: "उपलब्ध उत्पादने दाखवण्यासाठी आम्हाला तुमचे स्थान हवे आहे." } },
  "location.updating": { tr: { mr: "स्थान अपडेट होत आहे…" } },
  "location.errorUnsupported": { tr: { mr: "या ब्राउझरमध्ये स्थान सुविधा उपलब्ध नाही.", te: "ఈ బ్రౌజర్‌లో స్థాన సదుపాయం లేదు." } },
  "location.errorNoPincode": { tr: { kn: "ನಿಮ್ಮ ಸ್ಥಳಕ್ಕೆ ಪಿನ್‌ಕೋಡ್ ಕಂಡುಬಂದಿಲ್ಲ.", mr: "तुमच्या स्थानाचा पिनकोड सापडला नाही.", te: "మీ స్థానానికి పిన్‌కోడ్ కనుగొనబడలేదు." } },
  "location.errorFailed": { tr: { mr: "स्थान मिळाले नाही. कृपया पुन्हा प्रयत्न करा." } },
  "location.errorDenied": { tr: { mr: "स्थानाची परवानगी नाकारली. ब्राउझरमध्ये परवानगी द्या किंवा पिनकोड टाका." } },
  "product.notDeliverable": { tr: { mr: "सध्या तुमच्या स्थानावर डिलिव्हरी उपलब्ध नाही." } },
};
for (const [key, r] of Object.entries(REVIEW)) {
  if (!E[key]) throw new Error(`REVIEW: unknown key ${key}`);
  if ("app" in r) E[key][1] = r.app;
  Object.assign(E[key][2], r.tr);
  E[key][3] = r.force;
}

fs.mkdirSync(outDir, { recursive: true });
const reused = {};
for (const lang of ["en", ...LANGS]) {
  const out = {};
  for (const [key, [en, fk, tr, force]] of Object.entries(E)) {
    const fromApp = lang !== "en" && fk ? src[lang][fk]?.trim() : undefined;
    if (fk && lang !== "en" && !src[lang][fk] && !src.en[fk]) throw new Error(`farmsapp key missing: ${fk}`);
    if (fromApp && !force?.[lang]) reused[lang] = (reused[lang] ?? 0) + 1;
    out[key] = lang === "en" ? en : force?.[lang] || fromApp || tr[lang];
    const vars = (s) => (s.match(/\{\{\w+\}\}/g) ?? []).sort().join();
    if (vars(out[key]) !== vars(en)) throw new Error(`${lang} ${key}: placeholders differ from English`);
  }
  fs.writeFileSync(path.join(outDir, `${lang}.json`), JSON.stringify(out, null, 2) + "\n");
}
console.log(Object.keys(E).length, "keys; reused from farmsapp:", reused);
