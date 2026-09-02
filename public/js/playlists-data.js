/* ==========================================================================
   TCS RADIO - PLAYLISTS & CONTENT DATABASE
   Developed by Umair
   ========================================================================== */

const PLAYLISTS = {
  office: {
    id: "office",
    name: "Office (TCS)",
    badge: "🏢 TCS Office Mode",
    desc: "Soulful 2000s & Chai Break",
    bg: "img/hero-office.jpg",
    accent: "#f5b324",
    glow: "rgba(245, 179, 36, 0.14)",
    tracks: [
      { id: "lrAM_H7v8wM", title: "Kya Mujhe Pyaar Hai | Woh Lamhe | K.K.", credit: "T-Series" },
      { id: "eMA6GHTQ4WA", title: "Saathiya (Title) | Saathiya | Sonu Nigam", credit: "YRF" },
      { id: "kp-Bqr1Gtyw", title: "Sach Keh Raha Hai Deewana | Rehnaa Hai Terre Dil Mein | K.K.", credit: "Jjust Music" },
      { id: "2E2WA8_teMY", title: "Agar Tum Mil Jao | Zeher | Shreya Ghoshal, Roop Kumar Rathod", credit: "Vishesh Films" },
      { id: "sjzgLr9Iy4E", title: "Aa Bhi Ja | Sur | Lucky Ali, Sunidhi Chauhan", credit: "Universal Music India" },
      { id: "PqiddY3o3aY", title: "Dil Kehta Hai | Akele Hum Akele Tum | Kumar Sanu, Alka Yagnik", credit: "Ishtar Music" },
      { id: "mNSYPtzpfd4", title: "Jab Koi Baat Bigad Jaaye | Jurm | Kumar Sanu, Sadhna Sargam", credit: "Ishtar Music" },
      { id: "ioWh9vMixyw", title: "Tu Shayar Hai Main Teri Shayari | Saajan | Alka Yagnik", credit: "Ishtar Music" },
      { id: "_YjSmLlmqLM", title: "Aisi Deewangi | Deewana | Shahrukh Khan, Divya Bharti", credit: "Ishtar Music" },
      { id: "LtIJuk5te9E", title: "Pehli Baar Mile Hain | Saajan | S P Balasubramaniam", credit: "Ishtar Music" },
      { id: "bBjVLCAAM1A", title: "Dekha Hai Pehli Baar (Duet) | Saajan | Alka Yagnik, SPB", credit: "Ishtar Music" },
      { id: "plB0ytzIlqI", title: "Paas Woh Aane Lage | Main Khiladi Tu Anari | Kumar Sanu", credit: "Ishtar Music" }
    ],
    quotes: [
      "टाइम्सशीट भर दी भाई? चलो अब चाय पीते हैं और पुराने गाने सुनते हैं!",
      "Client call in 5 mins, meanwhile KK & Alka Yagnik on loop.",
      "Code compiling ho raha hai... nostalgia chalne do!",
      "Friday deployment ke baad sirf 2000s Bollywood bacha sakta hai.",
      "Sirf ₹10 ki cutting chai, baaki corporate gyaan aur standup free.",
      "Bug fix baad mein, pehle ye gaana poora sunenge!"
    ]
  },
  auto: {
    id: "auto",
    name: "Auto (Jhankar)",
    badge: "🛺 Auto Jhankar Beats",
    desc: "Street Bass Booster & 90s/2000s Hits",
    bg: "img/hero-auto.jpg",
    accent: "#ff9d2e",
    glow: "rgba(255, 157, 46, 0.16)",
    tracks: [
      { id: "Jzd4bma3QNo", title: "Koi Mil Gaya | Kuch Kuch Hota Hai | Udit Narayan, Alka Yagnik", credit: "Sony Music India" },
      { id: "a9XB-usvWU4", title: "Tan Tana Tan Tan | Judwaa | Abhijeet, Poornima", credit: "Ishtar Music" },
      { id: "KvWylZjOrYs", title: "Dilbar Dilbar | Sirf Tum | Alka Yagnik", credit: "T-Series" },
      { id: "jVPyBCrapoI", title: "Ek Pal Ka Jeena | Kaho Naa Pyaar Hai | Udit Narayan", credit: "Saregama" },
      { id: "Yqj1_V90KJo", title: "Chura Ke Dil Mera | Main Khiladi Tu Anari | Kumar Sanu, Alka", credit: "Ishtar Music" },
      { id: "PUO7_Gi6ipg", title: "Baazigar O Baazigar | Baazigar | Shahrukh Khan, Kajol", credit: "Ishtar Music" },
      { id: "x_a2ZVkYw_o", title: "Tumse Milne Ki Tamanna Hai | Saajan | S P Balasubramaniam", credit: "Ishtar Music" },
      { id: "thjRNwjmAdQ", title: "Tumse Milne Ki Tamanna (Duet) | Saajan | Salman Khan, Madhuri", credit: "Ishtar Music" },
      { id: "_YjSmLlmqLM", title: "Aisi Deewangi | Deewana | Shahrukh Khan, Divya Bharti", credit: "Ishtar Music" },
      { id: "ioWh9vMixyw", title: "Tu Shayar Hai Main Teri Shayari | Saajan | Alka Yagnik", credit: "Ishtar Music" },
      { id: "plB0ytzIlqI", title: "Paas Woh Aane Lage | Main Khiladi Tu Anari | Kumar Sanu", credit: "Ishtar Music" },
      { id: "qGOTe3KmCdY", title: "Kitna Haseen Chehra | Dilwale | Kumar Sanu", credit: "Ishtar Music" }
    ],
    quotes: [
      "मीटर से चलोगे भैया? 'नहीं साहेब, ₹30 एक्स्ट्रा लगेगा!'",
      "ऑटो में फुल बास और 90s झंकार बीट्स का मज़ा ही अलग है।",
      "रेड सिग्नल पर अल्ताफ़ राजा और ग्रीन सिग्नल पर उदित नारायण!",
      "ऑटो भैया का गोल्डन रूल: 'साइड नहीं दूंगा, रास्ता खुद बना लो!'",
      "पीछे वाले शीशे पर लिखा है: 'बुरी नज़र वाले, अपना काम कर!'"
    ]
  },
  truck: {
    id: "truck",
    name: "Truck (Highway)",
    badge: "🚚 Highway Truck Dhaba",
    desc: "Dhaba Melodies & Punjabi Beats",
    bg: "img/hero-truck.jpg",
    accent: "#ff7847",
    glow: "rgba(255, 120, 71, 0.16)",
    tracks: [
      { id: "KpuTKyfGM5w", title: "Bole Chudiyan | Kabhi Khushi Kabhie Gham | Udit Narayan, Alka Yagnik", credit: "Sony Music India" },
      { id: "LCqEVvBcg04", title: "Maa Da Laadla | Dostana | Master Saleem", credit: "Sony Music India" },
      { id: "x9WO2ieJMYk", title: "Mundian To Bach Ke | Panjabi MC", credit: "Altra Moda Music" },
      { id: "-1sBO30cUC4", title: "Desi Girl | Dostana | Sunidhi Chauhan", credit: "Sony Music India" },
      { id: "_rGz16v3CUM", title: "Gur Nalon Ishq Mitha | Bally Sagoo ft. Malkit Singh", credit: "Universal Music India" },
      { id: "PQmrmVs10X8", title: "Chaiyya Chaiyya | Dil Se | Sukhwinder Singh, Sapna Awasthi", credit: "Ishtar Music" },
      { id: "vTIIMJ9tUc8", title: "Tunak Tunak Tun | Daler Mehndi", credit: "Daler Mehndi Official" },
      { id: "Yqj1_V90KJo", title: "Chura Ke Dil Mera | Main Khiladi Tu Anari | Kumar Sanu", credit: "Ishtar Music" },
      { id: "PUO7_Gi6ipg", title: "Baazigar O Baazigar | Baazigar | Shahrukh Khan, Kajol", credit: "Ishtar Music" },
      { id: "bBjVLCAAM1A", title: "Dekha Hai Pehli Baar | Saajan | Alka Yagnik, SPB", credit: "Ishtar Music" },
      { id: "qGOTe3KmCdY", title: "Kitna Haseen Chehra | Dilwale | Ajay Devgan", credit: "Ishtar Music" },
      { id: "mNSYPtzpfd4", title: "Jab Koi Baat Bigad Jaaye | Jurm | Kumar Sanu, Sadhna", credit: "Ishtar Music" }
    ],
    quotes: [
      "Horn OK Please — बुरी नज़र वाले तेरा मुंह मीठा!",
      "हाईवे पर 90 km/h की स्पीड और सुखविंदर सिंह की आवाज़!",
      "ढाबे की कड़क मलाई चाय और नॉन-स्टॉप देसी तड़का!",
      "गाड़ी धीरे चलाएं — आगे 2000s का शुद्ध नॉस्टैल्जिया है।",
      "ट्रक के पीछे लिखा है: 'देख मगर प्यार से, और गाना सुन ध्यान से!'"
    ]
  },
  monsoon: {
    id: "monsoon",
    name: "Monsoon (90s)",
    badge: "🌧️ 90s Monsoon Romance",
    desc: "Late Night Melodies & Rain Ambience",
    bg: "img/hero-monsoon.jpg",
    accent: "#6ea8ff",
    glow: "rgba(110, 168, 255, 0.2)",
    tracks: [
      { id: "vjctMsE17CU", title: "Lagi Aaj Sawan Ki | Chandni | Suresh Wadkar", credit: "Saregama" },
      { id: "-JF3JM6_Yh4", title: "Ghanan Ghanan | Lagaan | Udit Narayan, Sukhwinder Singh", credit: "Sony Music India" },
      { id: "fC3MT7S7C8Y", title: "Chaand Taare | Yes Boss | Abhijeet", credit: "Ishtar Music" },
      { id: "asw-wTDzGUQ", title: "Barso Re | Guru | Shreya Ghoshal", credit: "Sony Music India" },
      { id: "1wc0o9lMjUU", title: "Kuchh Na Kaho | 1942: A Love Story | Kumar Sanu", credit: "Saregama" },
      { id: "_YjSmLlmqLM", title: "Aisi Deewangi | Deewana | Shahrukh Khan, Divya Bharti", credit: "Ishtar Music" },
      { id: "bBjVLCAAM1A", title: "Dekha Hai Pehli Baar | Saajan | Alka Yagnik, SPB", credit: "Ishtar Music" },
      { id: "PqiddY3o3aY", title: "Dil Kehta Hai | Akele Hum Akele Tum | Kumar Sanu", credit: "Ishtar Music" },
      { id: "LtIJuk5te9E", title: "Pehli Baar Mile Hain | Saajan | S P Balasubramaniam", credit: "Ishtar Music" },
      { id: "mNSYPtzpfd4", title: "Jab Koi Baat Bigad Jaaye | Jurm | Kumar Sanu, Sadhna", credit: "Ishtar Music" },
      { id: "ioWh9vMixyw", title: "Tu Shayar Hai Main Teri Shayari | Saajan | Alka Yagnik", credit: "Ishtar Music" },
      { id: "plB0ytzIlqI", title: "Paas Woh Aane Lage | Main Khiladi Tu Anari | Kumar Sanu", credit: "Ishtar Music" }
    ],
    quotes: [
      "बारिश की बूँदें, गरम चाय और 90s के रोमांटिक नगमे!",
      "रिमझिम गिरे सावन... दिल में बजते पुराने तराने।",
      "खिड़की के पास बैठो और अलका जी की आवाज़ महसूस करो।",
      "पुरानी यादें और चाय की चुस्की — यही तो ज़िन्दगी है!"
    ]
  },
  tapri: {
    id: "tapri",
    name: "Chai Tapri",
    badge: "☕ Chai Tapri Golden Hits",
    desc: "Roadside Tea Stall Evergreen Tunes",
    bg: "img/hero-tapri.jpg",
    accent: "#ffcf5c",
    glow: "rgba(255, 207, 92, 0.16)",
    tracks: [
      { id: "P-0EiCkAFnE", title: "Dil To Pagal Hai (Title) | DTPH | Lata Mangeshkar, Udit Narayan", credit: "YRF" },
      { id: "VxuhxfZPOU0", title: "Aankhon Ki Gustakhiyan | Hum Dil De Chuke Sanam | Kumar Sanu, Kavita Krishnamurthy", credit: "T-Series" },
      { id: "7TManB-eG_g", title: "Saat Samundar Paar | Vishwatma | Udit Narayan, Jolly Mukherjee", credit: "Saregama" },
      { id: "nT-DPEMZvsU", title: "Chand Sifarish | Fanaa | Shaan, Kailash Kher", credit: "YRF" },
      { id: "OT3ganL9mjQ", title: "Pardesi Pardesi | Raja Hindustani | Udit Narayan, Alka Yagnik", credit: "Tips Music" },
      { id: "mNSYPtzpfd4", title: "Jab Koi Baat Bigad Jaaye | Jurm | Kumar Sanu, Sadhna", credit: "Ishtar Music" },
      { id: "PqiddY3o3aY", title: "Dil Kehta Hai | Akele Hum Akele Tum | Kumar Sanu", credit: "Ishtar Music" },
      { id: "x_a2ZVkYw_o", title: "Tumse Milne Ki Tamanna Hai | Saajan | S P B", credit: "Ishtar Music" },
      { id: "qGOTe3KmCdY", title: "Kitna Haseen Chehra | Dilwale | Kumar Sanu", credit: "Ishtar Music" },
      { id: "LtIJuk5te9E", title: "Pehli Baar Mile Hain | Saajan | S P B", credit: "Ishtar Music" },
      { id: "_YjSmLlmqLM", title: "Aisi Deewangi | Deewana | Alka Yagnik", credit: "Ishtar Music" },
      { id: "Yqj1_V90KJo", title: "Chura Ke Dil Mera | Main Khiladi Tu Anari | Kumar Sanu", credit: "Ishtar Music" }
    ],
    quotes: [
      "एक कटिंग चाय, दो पारले-जी और रेडियो पर सदाबहार तराने।",
      "टपरी पर चाय की चुस्की और दोस्तों के साथ महफ़िल।",
      "चाय वाले भैया: 'साहब, दो मिनट रुकिए, सबसे बेहतरीन गाना बज रहा है!'",
      "दुनिया की टेंशन छोड़ो, पहले चाय ख़त्म करो।"
    ]
  },
  indipop: {
    id: "indipop",
    name: "Indipop & Cassette",
    badge: "🎸 Indipop & Cassette Era",
    desc: "2000s Pop Bands & College Vibes",
    bg: "img/hero-indipop.jpg",
    accent: "#c184ff",
    glow: "rgba(193, 132, 255, 0.18)",
    tracks: [
      { id: "qZgTPiuifBo", title: "O Sanam | Sunoh | Lucky Ali", credit: "Sony Music India" },
      { id: "ecPMVO7JuTo", title: "Dooba Dooba | Boondein | Silk Route", credit: "Sony Music India" },
      { id: "rII0ikL9cdQ", title: "Dhoom Pichuck | Euphoria", credit: "The Orchard" },
      { id: "p9r2GxMlRD4", title: "Meri Chunar Udd Udd Jaye | Falguni Pathak", credit: "Falguni Pathak" },
      { id: "-LESbtPT8uw", title: "Kaho Naa Pyaar Hai (Title) | KNPH | Alka Yagnik, Udit Narayan", credit: "Zee Music Company" },
      { id: "mgF6SGtEr6g", title: "Dil Chahta Hai (Title) | Dil Chahta Hai | Shankar Mahadevan", credit: "T-Series" },
      { id: "PUO7_Gi6ipg", title: "Baazigar O Baazigar | Baazigar | Shahrukh Khan, Kajol", credit: "Ishtar Music" },
      { id: "PQmrmVs10X8", title: "Chaiyya Chaiyya | Dil Se | Sukhwinder Singh", credit: "Ishtar Music" },
      { id: "vTIIMJ9tUc8", title: "Tunak Tunak Tun | Daler Mehndi", credit: "Daler Mehndi Official" },
      { id: "Yqj1_V90KJo", title: "Chura Ke Dil Mera | Main Khiladi Tu Anari | Kumar Sanu", credit: "Ishtar Music" },
      { id: "_YjSmLlmqLM", title: "Aisi Deewangi | Deewana | Shahrukh Khan", credit: "Ishtar Music" },
      { id: "thjRNwjmAdQ", title: "Tumse Milne Ki Tamanna Hai | Saajan | Salman Khan", credit: "Ishtar Music" }
    ],
    quotes: [
      "2000s के वो कॉलेज के दिन और कैसेट वाले पॉप गाने!",
      "वॉकमेन की बैटरी खत्म, लेकिन यादें हमेशा ताज़ा।",
      "जब एमटीवी और चैनल वी पर सिर्फ अच्छे गाने आते थे।",
      "रिमोट छोड़कर कैसेट की रील पेंसिल से घुमाने का दौर!"
    ]
  }
};

const FAQ_DATA = [
  ["What is TCS Radio?",
   "TCS Radio (Total Chill Station / Tata Chai & Symphony), created by developer Umair, is a free 2000s Indian retro ambient radio that recreates the sounds and melodies of Indian tech offices, auto rickshaws, and highway trucks with timeless Bollywood tracks and ambient sounds."],
  ["What playlists are available?",
   "You can choose from 6 iconic soundscapes: 🏢 Office (TCS), 🛺 Auto (Jhankar), 🚚 Truck (Highway), 🌧️ Monsoon (90s Romance), ☕ Chai Tapri (Golden Hits), and 🎸 Indipop & Cassette."],
  ["How does playlist auto-progression work?",
   "When all songs in your active playlist have played, TCS Radio automatically transitions to the next playlist in the cycle so your music never stops!"],
  ["Can I play TCS Radio in the background?",
   "Yes! TCS Radio features complete background playback support with the browser MediaSession API and an audio keep-alive session, allowing you to lock your screen or switch tabs while music continues smoothly."],
  ["How can I suggest a song or request removal?",
   "We deeply respect all copyright owners, artists, and listeners! Click '🎵 Add / Remove Songs' in the top bar or footer to connect directly with Umair instead of reporting. We take action within 24 hours with zero hassle."],
  ["Is TCS Radio free to use?",
   "Yes! TCS Radio is 100% free with zero annoying pop-up ads, no login, and no payment required. All songs stream straight into your browser on desktop and mobile."],
  ["How do I toggle the video player?",
   "By default, video is hidden for an audio-first, distraction-free retro radio experience. You can toggle the 📺 Video button on the player controls anytime you want to watch the music clip."]
];

// Helper functions
const $ = (s) => document.querySelector(s);
const fmt = (s) => {
  if (!s || isNaN(s)) return "0:00";
  s = Math.floor(s);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
};

function storageGet(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
function storageSet(key, val) { try { localStorage.setItem(key, val); } catch (_) { return false; } }
function sessionGet(key) { try { return sessionStorage.getItem(key); } catch (_) { return null; } }
function sessionSet(key, val) { try { sessionStorage.setItem(key, val); } catch (_) {} }
