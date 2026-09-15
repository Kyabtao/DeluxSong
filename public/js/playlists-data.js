/* ==========================================================================
   TCS RADIO - PLAYLISTS & CONTENT DATABASE
   Developed by Umair
   NOTE: Tracks have been de-duplicated across playlists so each station
         feels like a distinct course (no repeats as you switch).
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
      { id: "plB0ytzIlqI", title: "Paas Woh Aane Lage | Main Khiladi Tu Anari | Kumar Sanu", credit: "Ishtar Music" },
      { id: "k3g_WjLCsXM", title: "Sajni | Laapataa Ladies | Arijit Singh", credit: "T-Series" }
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
      { id: "nYLkyW2dDXU", title: "Bijuria | Sunny Sanskari Ki Tulsi Kumari | Sonu Nigam, Asees Kaur", credit: "Sony Music India" }
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
      { id: "1wc0o9lMjUU", title: "Kuchh Na Kaho | 1942: A Love Story | Kumar Sanu", credit: "Saregama" }
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
      { id: "OT3ganL9mjQ", title: "Pardesi Pardesi | Raja Hindustani | Udit Narayan, Alka Yagnik", credit: "Tips Music" }
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
      { id: "mgF6SGtEr6g", title: "Dil Chahta Hai (Title) | Dil Chahta Hai | Shankar Mahadevan", credit: "T-Series" }
    ],
    quotes: [
      "2000s के वो कॉलेज के दिन और कैसेट वाले पॉप गाने!",
      "वॉकमेन की बैटरी खत्म, लेकिन यादें हमेशा ताज़ा।",
      "जब एमटीवी और चैनल वी पर सिर्फ अच्छे गाने आते थे।",
      "रिमोट छोड़कर कैसेट की रील पेंसिल से घुमाने का दौर!"
    ]
  },
  latest: {
    id: "latest",
    name: "Latest Hits",
    badge: "🎧 Latest Hits (2024–26)",
    desc: "Today's Chartbusters & New Releases",
    bg: "img/hero-latest.jpg",
    accent: "#ff4d8d",
    glow: "rgba(255, 77, 141, 0.18)",
    tracks: [
      { id: "4jO8EWJutfE", title: "Tu Hi Disda | Bhooth Bangla | Arijit Singh, Nikhita Gandhi", credit: "Zee Music Company" },
      { id: "lOHVMmZ6n3o", title: "Ghar Kab Aaoge | Border 2 | Sonu Nigam, Arijit Singh, Vishal Mishra, Diljit", credit: "T-Series" },
      { id: "BSJa1UytM8w", title: "Saiyaara (Title) | Saiyaara | Faheem Abdullah", credit: "YRF" },
      { id: "cUmUOb7j3dc", title: "Dhun | Saiyaara | Arijit Singh", credit: "YRF" },
      { id: "0v5eHPfy5Lk", title: "Barbaad | Saiyaara | Jubin Nautiyal", credit: "YRF" },
      { id: "GX9x62kFsVU", title: "Gehra Hua | Dhurandhar | Arijit Singh", credit: "Saregama Music" },
      { id: "N4wK3NtVRT0", title: "Pardesiya | Param Sundari | Sonu Nigam, Krishnakali Saha", credit: "Universal Music India" },
      { id: "hxMNYkLN7tI", title: "Aaj Ki Raat | Stree 2 | Madhubanti Bagchi, Divya Kumar", credit: "Saregama Music" },
      { id: "KGn-erOG-Bs", title: "Laal Pari | Housefull 5 | Yo Yo Honey Singh", credit: "T-Series" },
      { id: "FZLadzn5i6Q", title: "Uyi Amma | Azaad | Madhubanti Bagchi", credit: "Zee Music Company" },
      { id: "d6KJkavA8zk", title: "Jaane Tu | Chhaava | Arijit Singh", credit: "Sony Music India" },
      { id: "cTokGAQAaK4", title: "Chillgum | 51 Glorious Days | Yo Yo Honey Singh", credit: "T-Series" }
    ],
    quotes: [
      "2024–26 के चार्टबस्टर्स — अब इसी रेडियो पर!",
      "Saiyaara se Border 2 tak — sabse naye hits, ek hi station par.",
      "Naya gana, wahi purana feel — latest hits, retro dil.",
      "Reels mein 15 second suna tha? Yahan poora gana suno!",
      "Charts badalte rehte hain, ye station hamesha fresh rehta hai."
    ]
  },
  love: {
    id: "love",
    name: "Love Songs",
    badge: "❤️ Love Songs Forever",
    desc: "Romantic Hits & Soulful Duets",
    bg: "img/hero-love.jpg",
    accent: "#ff6b9d",
    glow: "rgba(255, 107, 157, 0.18)",
    tracks: [
      { id: "mt9xg0mmt28", title: "Tum Se Hi | Jab We Met | Mohit Chauhan", credit: "T-Series" },
      { id: "QIQSQWvt4-M", title: "Tera Hone Laga Hoon | Ajab Prem Ki Ghazab Kahani | Atif Aslam, Alisha Chinai", credit: "Tips Music" },
      { id: "FA_J8XwpCaQ", title: "Tu Jaane Na | Ajab Prem Ki Ghazab Kahani | Atif Aslam", credit: "Tips Music" },
      { id: "kw_FEnJrnds", title: "Pee Loon | Once Upon a Time in Mumbaai | Mohit Chauhan", credit: "T-Series" },
      { id: "JBCx0QyP8VQ", title: "Pehli Nazar Mein | Race | Atif Aslam", credit: "Tips Music" },
      { id: "Gh5wHtqW9Ek", title: "Tujhe Bhula Diya | Anjaana Anjaani | Mohit Chauhan, Shruti Pathak", credit: "T-Series" },
      { id: "voxzKOoudpc", title: "Tum Dil Ki Dhadkan Mein | Dhadkan | Kumar Sanu", credit: "Ishtar Music" },
      { id: "S9DsCP9Th7Y", title: "Kuch Kuch Hota Hai (Title) | KKHH | Udit Narayan, Alka Yagnik", credit: "Sony Music India" },
      { id: "LH9REAV5UzU", title: "Maula Mere Maula | Anwar | Roop Kumar Rathod", credit: "Saregama" },
      { id: "gJLVTKhTnog", title: "Husn | Anuv Jain", credit: "Anuv Jain" },
      { id: "f419vqAt8PU", title: "Ishq | Lost;Found | Faheem Abdullah, Rauhan Malik", credit: "Faheem Abdullah" }
    ],
    quotes: [
      "दिल को छू लेने वाले गाने — लव सॉन्ग्स की अलग ही महफ़िल है! ❤️",
      "Pyaar ka matlab = purane love songs aur ek cutting chai ☕",
      "सच्चा प्यार वही है जो लव सॉन्ग्स को रिपीट पर सुनने जैसा है।",
      "Tum se hi din chadhta hai... love songs on, duniya off 💕",
      "First crush, first cassette, first love — sab isi station par!"
    ]
  },
  kk: {
    id: "kk",
    name: "K.K. Special",
    badge: "🎙️ K.K. Special",
    desc: "The Voice of 2000s & Emraan Hits",
    bg: "img/hero-kk.jpg",
    accent: "#5ec8ff",
    glow: "rgba(94, 200, 255, 0.18)",
    tracks: [
      { id: "ywk4puRqaEY", title: "Alvida | Life in a Metro | K.K.", credit: "Sony Music India" },
      { id: "cmMiyZaSELo", title: "Khuda Jaane | Bachna Ae Haseeno | K.K., Shilpa Rao", credit: "YRF" },
      { id: "-PDFj1Lm7r0", title: "Zara Sa | Jannat | K.K.", credit: "Sony Music India" },
      { id: "Ha4BUOcLQE4", title: "Aankhon Mein Teri | Om Shanti Om | K.K.", credit: "T-Series" },
      { id: "cGNcjqXe87U", title: "Tu Hi Meri Shab Hai | Gangster | K.K.", credit: "Sony Music India" },
      { id: "vT5VCRp4FZ4", title: "Labon Ko | Bhool Bhulaiyaa | K.K.", credit: "T-Series" },
      { id: "s641QVbuOfw", title: "O Meri Jaan | Life in a Metro | K.K.", credit: "Sony Music India" },
      { id: "qE3DfF66DNA", title: "Dus Bahane | Dus | K.K., Shaan", credit: "T-Series" },
      { id: "LCfvYo3ILG0", title: "Yaaron | Pal | K.K.", credit: "Sony Music India" }
    ],
    quotes: [
      "K.K. ki awaaz = 2000s ki poori feeling ek hi station par 🎙️",
      "Emraan Hashmi movies + K.K. ki voice = pure nostalgia!",
      "खुदा जाने... K.K. के गाने आज भी दिल के सबसे करीब हैं।",
      "Campus ke woh din, K.K. ke woh gaane — kash woh laut aayein ❤️",
      "K.K. is not gone — he lives in every note. 🎧"
    ]
  },
  sonu: {
    id: "sonu",
    name: "Sonu Nigam Special",
    badge: "🌟 Sonu Nigam Special",
    desc: "Golden Voice Across Generations",
    bg: "img/hero-sonu.jpg",
    accent: "#ffd166",
    glow: "rgba(255, 209, 102, 0.18)",
    tracks: [
      { id: "g0eO74UmRBs", title: "Kal Ho Naa Ho (Title) | KHNH | Sonu Nigam", credit: "Sony Music India" },
      { id: "sAjDONNZp_0", title: "Main Agar Kahoon | Om Shanti Om | Sonu Nigam, Shreya Ghoshal", credit: "T-Series" },
      { id: "AdY_KpBmi6k", title: "Abhi Mujh Mein Kahin | Agneepath | Sonu Nigam", credit: "Sony Music India" },
      { id: "L0zKs8i7Nc8", title: "Suraj Hua Maddham | Kabhi Khushi Kabhie Gham | Sonu Nigam, Alka Yagnik", credit: "Sony Music India" },
      { id: "MqGVFL24_8E", title: "Main Hoon Na (Title) | Main Hoon Na | Sonu Nigam, Shreya Ghoshal", credit: "T-Series" },
      { id: "T4wr-y_bqB8", title: "Yeh Dil Deewana | Pardes | Sonu Nigam", credit: "Tips Music" },
      { id: "z3ZduZd0cGk", title: "Deewana Tera | Deewana Album | Sonu Nigam", credit: "T-Series" },
      { id: "dvRUnGYta0k", title: "Do Pal | Veer-Zaara | Sonu Nigam, Lata Mangeshkar", credit: "YRF" },
      { id: "xo8JU-Vc1C0", title: "Sau Dard | Jaan-E-Mann | Sonu Nigam", credit: "T-Series" }
    ],
    quotes: [
      "Sonu Nigam ki surili awaaz — har generation ki pasand! 🌟",
      "Kal Ho Naa Ho... par Sonu ke gaane hamesha saath hain.",
      "90s ka deewana, 2000s ka king — Sonu is the voice!",
      "कान खोलकर सुनिए — सोनू निगम का सुर कोई और नहीं गा सकता।",
      "Headphones on, Sonu Nigam on — bas yahi chahiye!"
    ]
  },
  arijit: {
    id: "arijit",
    name: "Arijit Singh Special",
    badge: "🎤 Arijit Singh Special",
    desc: "Today's Biggest Voice, Biggest Hits",
    bg: "img/hero-arijit.jpg",
    accent: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.18)",
    tracks: [
      { id: "81qmmlsIE3k", title: "Tum Hi Ho | Aashiqui 2 | Arijit Singh", credit: "T-Series" },
      { id: "z-diRlyLGzo", title: "Channa Mereya | Ae Dil Hai Mushkil | Arijit Singh", credit: "Sony Music India" },
      { id: "xRb8hxwN5zc", title: "Agar Tum Saath Ho | Tamasha | Arijit Singh, Alka Yagnik", credit: "T-Series" },
      { id: "_Olt3tqwjuE", title: "Muskurane | CityLights | Arijit Singh", credit: "Sony Music India" },
      { id: "HDVw7Y6uAws", title: "Raabta | Agent Vinod | Arijit Singh", credit: "T-Series" },
      { id: "RazuWp5kSHk", title: "Kabhi Jo Baadal Barse | Jackpot | Arijit Singh", credit: "T-Series" },
      { id: "Ic2HO9bAJJM", title: "Samjhawan | Humpty Sharma Ki Dulhania | Arijit Singh, Shreya Ghoshal", credit: "Sony Music India" },
      { id: "40ZVxZjCPcE", title: "Hawayein | Jab Harry Met Sejal | Arijit Singh", credit: "Sony Music India" },
      { id: "wx89ZdkwtS8", title: "Ae Dil Hai Mushkil (Title) | ADHM | Arijit Singh", credit: "Sony Music India" },
      { id: "9-AKLAfpjrI", title: "Khairiyat | Chhichhore | Arijit Singh", credit: "T-Series" },
      { id: "lpdRqn6xwiM", title: "Zaalima | Raees | Arijit Singh, Harshdeep Kaur", credit: "Zee Music Company" },
      { id: "enjkcCdAlXc", title: "Aavan Jaavan | War 2 | Arijit Singh, Nikhita Gandhi", credit: "YRF" }
    ],
    quotes: [
      "Arijit Singh ka ek gaana = 100 memories 💫",
      "Tum Hi Ho se Aavan Jaavan tak — Arijit ne dil pe raaj kiya hai!",
      "Har dukh ka ilaaj, har khushi ka soundtrack — Arijit Singh 🎤",
      "आरिजीत की आवाज़ में वो बात है जो शब्दों में नहीं।",
      "Playlist par Arijit, dil par full feel — enjoy!"
    ]
  },
  kumar: {
    id: "kumar",
    name: "Kumar Sanu Special",
    badge: "👑 Kumar Sanu Special",
    desc: "90s Melody King Classics",
    bg: "img/hero-kumar.jpg",
    accent: "#4ade80",
    glow: "rgba(74, 222, 128, 0.16)",
    tracks: [
      { id: "rXHY4Cv9cA8", title: "Ab Tere Bin | Aashiqui | Kumar Sanu", credit: "T-Series" },
      { id: "epUMTkG5pGk", title: "Dheere Dheere Se | Aashiqui | Kumar Sanu, Anuradha Paudwal", credit: "T-Series" },
      { id: "j1fWRA-z20g", title: "Sochenge Tumhe Pyaar | Deewana | Kumar Sanu", credit: "Shemaroo" },
      { id: "58VwkROgWGI", title: "Mera Dil Bhi Kitna Pagal Hai | Saajan | Kumar Sanu, Alka Yagnik", credit: "Ishtar Music" },
      { id: "vMV7Vel0dPk", title: "Ek Ladki Ko Dekha | 1942: A Love Story | Kumar Sanu", credit: "Saregama" },
      { id: "KC-DuX51NY0", title: "Yeh Kaali Kaali Aankhen | Baazigar | Kumar Sanu", credit: "Ishtar Music" },
      { id: "WkfcHsPKwds", title: "Meri Mehbooba | Pardes | Kumar Sanu, Alka Yagnik", credit: "Tips Music" },
      { id: "5SvIuD6wJRI", title: "Do Dil Mil Rahe Hain | Pardes | Kumar Sanu", credit: "Tips Music" },
      { id: "XWmon1qR6pM", title: "Saajanji Ghar Aaye | Kuch Kuch Hota Hai | Kumar Sanu, Alka Yagnik", credit: "Sony Music India" }
    ],
    quotes: [
      "Kumar Sanu ki awaaz = 90s ki pehli love story 👑",
      "आशिक़ी का वो दौर... कुमार सानु के साथ वापस चलें!",
      "Melody king ke gaane — dil ke sabse kareeb.",
      "Cassette ke zamane ka sabse bada voice, aaj phir se!",
      "Nazar ke saamne, dil ke paas — K.S. forever 💚"
    ]
  },
  udit: {
    id: "udit",
    name: "Udit Narayan Special",
    badge: "🌞 Udit Narayan Special",
    desc: "90s–2000s Superhit Voice",
    bg: "img/hero-udit.jpg",
    accent: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.16)",
    tracks: [
      { id: "m6Y8xEfyXTs", title: "Main Yahaan Hoon | Veer-Zaara | Udit Narayan", credit: "YRF" },
      { id: "-1J1XqOKnuw", title: "Bholi Si Surat | Dil To Pagal Hai | Udit Narayan, Lata Mangeshkar", credit: "YRF" },
      { id: "OTaYCjy9vXg", title: "Radha Kaise Na Jale | Lagaan | Udit Narayan, Asha Bhosle", credit: "Sony Music India" },
      { id: "dOd7mmzCzpI", title: "Udja Kale Kawan | Gadar | Udit Narayan, Alka Yagnik", credit: "Zee Music Company" },
      { id: "2knQOXevwKE", title: "Chand Chhupa Badal Mein | Hum Dil De Chuke Sanam | Udit Narayan, Alka Yagnik", credit: "T-Series" },
      { id: "DAy1I9ScdAA", title: "Yeh Ladka Hai Deewana | Kuch Kuch Hota Hai | Udit Narayan, Alka Yagnik", credit: "Sony Music India" }
    ],
    quotes: [
      "Udit Narayan = 90s ki sabse fresh aur masti bhari awaaz! 🌞",
      "Pardesi se Gadar tak — Udit ji ka safar hi kamaal hai.",
      "कुमार सानु के बाद अगर कोई राज करता था तो उदित जी!",
      "KKHH, DTPH, Gadar — Udit ki awaaz har classic mein hai.",
      "Retro romance ka full paisa-vasool station ☀️"
    ]
  },
  shreya: {
    id: "shreya",
    name: "Shreya Ghoshal Special",
    badge: "🎼 Shreya Ghoshal Special",
    desc: "Melody Queen's Finest",
    bg: "img/hero-shreya.jpg",
    accent: "#e879f9",
    glow: "rgba(232, 121, 249, 0.16)",
    tracks: [
      { id: "OQ3fxbhD-l0", title: "Teri Ore | Singh Is Kinng | Rahat Fateh Ali Khan, Shreya Ghoshal", credit: "Junglee Music" },
      { id: "GtNrQy90Ih4", title: "Saibo | Shor in the City | Shreya Ghoshal, Tochi Raina", credit: "Sony Music India" },
      { id: "omiswoHnoTk", title: "Sunn Raha Hai Na Tu (Female) | Aashiqui 2 | Shreya Ghoshal", credit: "T-Series" },
      { id: "4whc8stLm8o", title: "Deewani Mastani | Bajirao Mastani | Shreya Ghoshal", credit: "Sony Music India" },
      { id: "XoF9kwi-yHI", title: "Nagada Sang Dhol | Ram-leela | Shreya Ghoshal", credit: "Sony Music India" },
      { id: "T1Y2fVgSKhU", title: "Yeh Ishq Hai | Jab We Met | Shreya Ghoshal", credit: "T-Series" },
      { id: "zvHapBaPW60", title: "Saans | Jab Tak Hai Jaan | Shreya Ghoshal, Mohit Chauhan", credit: "YRF" },
      { id: "mkOGY6_U6qI", title: "Teri Meri | Bodyguard | Rahat Fateh Ali Khan, Shreya Ghoshal", credit: "T-Series" }
    ],
    quotes: [
      "Shreya Ghoshal — jinke sur mein jaan hai 🎼",
      "Deewani Mastani se Saans tak — har gaana ek kahani.",
      "श्रेया जी की आवाज़ सुनकर दिल पिघल जाता है ❄️",
      "Melody Queen on loop — ears blessed!",
      "Classic thumri feel, modern Bollywood soul — Shreya only."
    ]
  },
  atif: {
    id: "atif",
    name: "Atif Aslam Special",
    badge: "🎸 Atif Aslam Special",
    desc: "Soulful 2000s Rock Ballads",
    bg: "img/hero-atif.jpg",
    accent: "#ef4444",
    glow: "rgba(239, 68, 68, 0.16)",
    tracks: [
      { id: "mX0_1yejIQI", title: "Woh Lamhe Woh Baatein | Zeher | Atif Aslam", credit: "Sony Music India" },
      { id: "SAcpESN_Fk4", title: "Dil Diyan Gallan | Tiger Zinda Hai | Atif Aslam", credit: "YRF" },
      { id: "AsLPGPs5iQk", title: "Jeena Jeena | Badlapur | Atif Aslam", credit: "Sony Music India" },
      { id: "3M3o3Ak1qBY", title: "Jeene Laga Hoon | Ramaiya Vastavaiya | Atif Aslam, Shreya Ghoshal", credit: "Tips Music" },
      { id: "VmjynPkyLRQ", title: "Tu Chahiye | Bajrangi Bhaijaan | Atif Aslam", credit: "T-Series" }
    ],
    quotes: [
      "Atif Aslam — 2000s ke har love story ka soundtrack 🎸",
      "Woh Lamhe se Dil Diyan Gallan tak — sab Atif ne gaya hai!",
      "आदत से लेकर Gallan तक — अतिफ़ का जादू है ये।",
      "Rock + soul + Atif = full volume please 🤘",
      "Jab Atif gaate hain, dil dhadakta hai — Atif era!"
    ]
  },
  new: {
    id: "new",
    name: "New Songs",
    badge: "🆕 Brand New Songs",
    desc: "Fresh Drops & Trending Now",
    bg: "img/hero-new.jpg",
    accent: "#2dd4bf",
    glow: "rgba(45, 212, 191, 0.18)",
    tracks: [
      { id: "XO8wew38VM8", title: "Millionaire | Glory | Yo Yo Honey Singh", credit: "T-Series" },
      { id: "n2dVFdqMYGA", title: "Sahiba | Aditya Rikhari", credit: "T-Series" },
      { id: "3Cp2QTBZAFQ", title: "Finding Her | Kushagra, Bharath", credit: "UR Debut" },
      { id: "C3njz8sf4aM", title: "Ehsaas | Faheem Abdullah", credit: "Universal Music India" },
      { id: "f_OZkQV0LHQ", title: "Tumhare Hi Rahenge Hum | Stree 2 | Varun Jain, Shilpa Rao", credit: "Saregama Music" },
      { id: "OgRoRBLZbUQ", title: "Angaaron | Pushpa 2 | Shreya Ghoshal", credit: "T-Series" },
      { id: "-2RAq5o5pwc", title: "Jhol | Coke Studio Pakistan | Maanu, Annural Khalid", credit: "Coke Studio" },
      { id: "ilNt2bikxDI", title: "Jo Tum Mere Ho | Anuv Jain", credit: "Anuv Jain" },
      { id: "bjfKyIAlsZs", title: "O Maahi | Dunki | Arijit Singh, Pritam", credit: "T-Series" },
      { id: "uTuchIYZdbM", title: "Tauba Tauba | Bad Newz | Karan Aujla", credit: "Saregama Music" },
      { id: "vKb9xwSRrsU", title: "Pasoori | Coke Studio | Ali Sethi, Shae Gill", credit: "Giraffe Pakistan" },
      { id: "eUwS1KJhQAc", title: "Khoobsurat | Stree 2 | Vishal Mishra, Sachin-Jigar", credit: "Saregama Music" }
    ],
    quotes: [
      "बिल्कुल नए गाने — जो अभी charts पर छाए हुए हैं! 🆕",
      "Reels pe viral, ab TCS Radio pe — fresh drops only!",
      "Naya gaana har hafte, wahi purana radio feel.",
      "Saiyaara se Tauba Tauba tak — abhi ki sabse badi hits!",
      "Trending now: ye station, ye gaane, aur aap ☕"
    ]
  },
  old: {
    id: "old",
    name: "Golden Oldies (60s–80s)",
    badge: "📀 Golden Oldies (60s–80s)",
    desc: "Kishore • Rafi • Lata • Mukesh",
    bg: "img/hero-old.jpg",
    accent: "#d97706",
    glow: "rgba(217, 119, 6, 0.18)",
    tracks: [
      { id: "fj4MnkljFXc", title: "Lag Ja Gale | Woh Kaun Thi | Lata Mangeshkar", credit: "Saregama" },
      { id: "_iDT9csOdeQ", title: "Mere Sapno Ki Rani | Aradhana | Kishore Kumar", credit: "Saregama" },
      { id: "y1mXCu3y7FI", title: "Kora Kagaz Tha | Aradhana | Kishore Kumar, Lata Mangeshkar", credit: "Saregama" },
      { id: "5lpAR0A4VHA", title: "Gaata Rahe Mera Dil | Guide | Kishore Kumar, Lata Mangeshkar", credit: "Saregama" },
      { id: "CrnRqE8hOIc", title: "O Mere Dil Ke Chain | Mere Jeevan Saathi | Kishore Kumar", credit: "Saregama" },
      { id: "vliT3T-uAe4", title: "Pal Pal Dil Ke Paas | Blackmail | Kishore Kumar", credit: "Universal Music India" },
      { id: "MakNjobg9J8", title: "Kya Hua Tera Wada | Hum Kisise Kum Naheen | Mohammed Rafi", credit: "Saregama" },
      { id: "WF0HJv-9S_4", title: "Chura Liya Hai Tumne | Yaadon Ki Baaraat | Asha Bhosle, Mohammed Rafi", credit: "Saregama" },
      { id: "NSt6CB9f9BY", title: "Awaara Hoon | Awaara | Mukesh", credit: "Zee Music Classic" }
    ],
    quotes: [
      "किशोर दा, रफ़ी साहब, लता जी — सुनहरा दौर फिर से! 📀",
      "Gramophone ke zamane ke asli superstars.",
      "Kishore da ka sur, Rafi sahab ki ada — kya baat hai!",
      "60s–80s ka wo jaadu jo aaj bhi dil jeet lete hain.",
      "Old is gold — ye station proof hai 💛"
    ]
  }
};

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
