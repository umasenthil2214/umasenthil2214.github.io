/* ------------------------------------------------------------------
   All site copy lives here. Every fact comes from Uma's résumé.
   ------------------------------------------------------------------ */

export const PROFILE = {
  name: 'Uma Senthil',
  first: 'UMA',
  role: 'Senior Mobile & IoT Software Engineer',
  focus: 'Android · iOS · Flutter · BLE Mesh · AI / LLM',
  location: 'Canada',
  email: 'umasenthil2214@gmail.com',
  phone: '+1 (587) 990-4836',
  phoneHref: 'tel:+15879904836',
  linkedin: 'https://www.linkedin.com/in/umamaheswari-senthil-2ab26949',
  github: 'https://github.com/umasenthil2214',
  resume: 'Uma_Senthil_Resume.pdf',
};

export const ABOUT =
  'I build production *Android,* *iOS* and cross-platform apps, and the *firmware* and connected systems behind them, from BLE Mesh wearables to private, on-premise AI assistants.';

export const ABOUT_POINTS = [
  'Lead code reviews and mentor developers',
  'Work closely with hardware & firmware teams',
  'Present to stakeholders and turn requirements into plans',
  'Ship apps on Google Play and the Apple App Store',
];

export const GROUPS = {
  Mobile: ['Kotlin', 'Java', 'Swift', 'Flutter', 'Jetpack Compose', 'React Native', 'Room', 'Hilt / Dagger', 'MVVM'],
  'IoT & BLE': ['BLE', 'BLE Mesh', 'GATT', 'OTA Updates', 'TCP / UDP Sockets', 'NFC'],
  Embedded: ['C / C++', 'STM32WB55', 'UART · SPI · I²C', 'Bootloaders', 'Hardware Bring-up'],
  'AI & LLM': ['RAG', 'Pinecone', 'GPT-4o', 'LLaMA 3', 'vLLM', 'Embeddings'],
  'Cloud & Backend': ['AWS', 'Supabase', 'PostgreSQL', 'Node.js', 'TypeScript', '.NET', 'PHP / MySQL'],
  'Web & DevOps': ['React', 'Unity 3D', 'Jenkins', 'Docker', 'Git'],
};
export const SKILLS = Object.entries(GROUPS).flatMap(([g, ws]) => ws.map((w) => ({ w, g })));

/* Four featured builds — each gets a monolith with a live animated screen */
export const PROJECTS = [
  {
    tag: 'DBTech · IoT Wearables · 2026',
    title: 'FASTER',
    em: 'SOS',
    desc: 'A festival-safety wristband platform and the basis for a Red Cross demonstration. End-to-end SOS from the band, across a BLE Mesh network and the Android app, to the Supabase backend and responders, acknowledged in under 100 ms.',
    stack: ['STM32WB55', 'C', 'BLE Mesh', 'Kotlin', 'Jetpack Compose', 'Room', 'Supabase'],
  },
  {
    tag: 'ThruLiquid · AI / LLM · 2024–26',
    title: 'Private AI',
    em: 'Assistant',
    desc: 'A ChatGPT-style assistant for law firms and security teams. A RAG pipeline answers questions from confidential case files with source citations, deployed on-premise behind a private VPN.',
    stack: ['Node.js', 'TypeScript', 'Pinecone', 'GPT-4o', 'LLaMA 3', 'vLLM', 'React'],
    link: 'https://github.com/umasenthil2214/uma-thruliquid-PrivateAI',
  },
  {
    tag: 'Levven Electronics · Smart Home · 2021–24',
    title: 'Levven',
    em: 'Controls',
    desc: 'One app for lights, dimmers and fans. Talks to devices over BLE and local Wi-Fi sockets at home, and switches to AWS cloud automatically when away. Includes OTA gateway updates.',
    stack: ['Flutter', 'Dart', 'Kotlin', 'BLE', 'Wi-Fi Sockets', 'AWS', 'Jenkins'],
    link: 'https://apps.apple.com/ca/app/levven-controls/id1436898660',
  },
  {
    tag: 'DBTech · FASTER · Red Cross demo · 2026',
    title: 'Red Cross',
    em: 'Demo',
    desc: 'FASTER for people without a phone. Staff register each person at an entry desk and give them a wristband; three gateway stations estimate which area each band is nearest, shown live on staff screens with Low, Medium or High confidence. Stations keep recording through internet outages, and bands broadcast only an ID, never a name.',
    stack: ['STM32WB55', 'BLE', 'USB Gateways', 'RSSI Zoning', 'Supabase', 'Staff Dashboards'],
  },
];

/* Rises as light towers. Values are taken directly from the résumé. */
export const STATS = [
  { label: 'Years building software', value: 15, suffix: '+', h: 4.6 },
  { label: 'Companies', value: 8, suffix: '', h: 3.2 },
  { label: 'Games hosted on one site', value: 1000, suffix: '+', h: 5.0 },
  { label: 'SOS acknowledgement', value: 100, prefix: '<', suffix: 'ms', h: 2.4 },
];

export const HONORS = [
  { big: 'Red Cross demonstration', small: 'FASTER phone-free registration · DBTech' },
  { big: 'Apps on Google Play & App Store', small: 'Levven · Stash · MyMilan' },
];

/* The corridor: one lit doorway per role, oldest first */
export const JOURNEY = [
  { year: '2011', role: 'Android Developer — Mobile Games', place: 'NETAXIS IT Solution · Chennai', note: '2011 — 2013 · Unity 3D, OpenGL ES, Cocos2d · gaming site with 1,000+ games' },
  { year: '2013', role: 'Senior Android Developer / Mobile Team Lead', place: 'Eloka Enterprises (Milanity) · Chennai', note: '2013 — 2016 · MyMilan home automation · Milan Symphony streaming · Samsung Smart TV app' },
  { year: '2017', role: 'Android & Web Developer', place: 'WebsZilla Technology · Chennai', note: '2017 — 2018 · Parent & Student apps for private schools · PHP admin panel' },
  { year: '2018', role: 'Senior Mobile Developer', place: 'ThruLiquid Inc · Toronto', note: '2018 · Android, iOS & web with Ionic, React and Node.js' },
  { year: '2019', role: 'Senior Android Developer — Security & NFC', place: 'Elsi Inc (Stash) · Edmonton', note: '2019 — 2021 · Offline NFC password manager · AES, RSA, SHA-256' },
  { year: '2021', role: 'Senior Mobile Application Developer', place: 'Levven Electronics · Edmonton', note: '2021 — 2024 · Smart-home app · BLE, Wi-Fi sockets, AWS · mentoring' },
  { year: '2024', role: 'Senior Mobile Developer & AI Consultant', place: 'ThruLiquid Inc · Mississauga', note: '2024 — 2026 · Private RAG assistants · Kotlin & React Native apps' },
  { year: '2026', role: 'Senior Embedded Firmware & Mobile Engineer', place: 'DBTech · Texas (remote)', note: '2026 — present · FASTER BLE Mesh wearable · STM32WB55 · Android · Supabase' },
  { year: '2026', role: 'Red Cross Demo — FASTER without a phone', place: 'DBTech · FASTER', note: 'Phone-free registration · 4 bands across 3 gateway zones · nearest-station estimates with confidence · keeps working offline' },
];

/* Orbiting cards: products built across the career */
export const BUILDS = [
  ['DBTech · 2026', 'Red Cross demo: phone-free registration'],
  ['DBTech · 2026', 'FASTER safety wristband'],
  ['ThruLiquid · 2024', 'Private AI legal assistant'],
  ['Levven · 2021', 'Levven Controls smart home'],
  ['Elsi Inc · 2019', 'Stash NFC password manager'],
  ['WebsZilla · 2017', 'School parent & student apps'],
  ['Milanity · 2013', 'MyMilan home automation'],
  ['Milanity · 2013', 'Milan Symphony streaming'],
  ['NETAXIS · 2011', 'Android & iOS games'],
];

export const EDUCATION = [
  { degree: 'M.Sc. Information Technology', school: 'TMG College of Arts and Science, Chennai', note: 'U.S. equivalency certified · Validential Corp. (GPA 3.37)' },
  { degree: 'Bachelor of Computer Applications', school: 'Kongu College of Arts & Science, Karur', note: '2008 — 2011' },
];
