/* ------------------------------------------------------------------
   All site copy lives here. Every fact comes from Uma's résumé.
   ------------------------------------------------------------------ */

export const PROFILE = {
  name: 'Uma Senthil',
  first: 'UMA',
  role: 'Senior Embedded Firmware & Systems Software Engineer',
  focus: 'STM32 Firmware · Telemetry · Bring-up · Test Automation',
  location: 'Canada',
  email: 'umasenthil2214@gmail.com',
  phone: '+1 (587) 990-4836',
  phoneHref: 'tel:+15879904836',
  linkedin: 'https://www.linkedin.com/in/umamaheswari-senthil-2ab26949',
  github: 'https://github.com/umasenthil2214',
  resume: 'Uma_Senthil_Resume.pdf',
};

export const ABOUT =
  'I build *embedded firmware* and the *systems software* around it: STM32 microcontrollers, custom radio protocols, gateway stations and *telemetry* pipelines, through to the backend and operator dashboards.';

export const ABOUT_POINTS = [
  'Command / acknowledge protocols under 100 ms',
  'Hardware bring-up, DVT & schematic review',
  'Bootloader & OTA with CRC-checked images',
  'Python test kits traced to validation plans',
];

export const GROUPS = {
  'Embedded & Firmware': ['C / C++', 'STM32WB55', 'Cortex-M4', 'STM32CubeIDE', 'I²C · SPI · UART', 'Bootloader · OTA', 'Low-power Design'],
  'Telemetry & Command': ['Binary Protocols', 'ACK / Retry', 'De-duplication', 'Store-and-forward', 'JSON over USB', '1 Hz Telemetry'],
  'Hardware & Test': ['Hardware Bring-up', 'Schematic Review', 'DVT', 'Python · pyserial', 'Validation Plans', 'RSSI Bench Tests'],
  'Links & Networking': ['BLE', 'BLE Mesh', 'GATT', 'TCP / UDP Sockets', 'NFC', 'TLS'],
  'Ground & Data': ['Supabase', 'PostgreSQL · PostGIS', 'ArcGIS', 'Node.js · TypeScript', 'React Dashboards', 'AWS', 'Docker'],
  'Apps & AI': ['Kotlin · Compose', 'Swift', 'Flutter', 'RAG', 'LLaMA 3 · vLLM', 'Git · Jenkins'],
};
export const SKILLS = Object.entries(GROUPS).flatMap(([g, ws]) => ws.map((w) => ({ w, g })));

/* Four featured builds — each gets a monolith with a live animated screen (order matches Gallery DRAW) */
export const PROJECTS = [
  {
    tag: 'DBTech · Embedded firmware · 2026',
    title: 'FASTER',
    em: 'SOS',
    desc: 'Wearable safety platform for festivals and indoor disaster shelters, demonstrated to the Red Cross. On battery-powered STM32WB55 wristbands, a custom BLE Mesh vendor model in C carries telemetry and alerts; every SOS has an event ID, retry counter and timestamp, is acknowledged in under 100 ms, de-duplicated across the mesh, and falls back cleanly when delivery cannot be confirmed.',
    stack: ['C', 'STM32WB55', 'BLE Mesh', 'Bootloader · OTA', 'Kotlin · Room', 'Supabase'],
  },
  {
    tag: 'DBTech · Disaster shelters · Red Cross · 2026',
    title: 'Red Cross',
    em: 'Disaster Project',
    desc: 'FASTER for open-floor shelters such as school gyms, demonstrated to the Red Cross. Guests register by QR code, kiosk or reception desk, alone or as a family, and every guest, including each child, gets a wristband. My USB dongle firmware and Local Bridge app set up each band over Bluetooth without a phone, and gateway firmware streams RSSI so staff see each guest as near, moderate or far, with history.',
    stack: ['STM32WB55', 'USB Dongle', 'Local Bridge App', 'BLE Provisioning', 'RSSI Tracking', 'Supabase'],
  },
  {
    tag: 'ThruLiquid · On-premise AI · 2024–26',
    title: 'Private AI',
    em: 'Assistant',
    desc: 'Answers questions from confidential files with source citations. RAG pipeline in Node.js / TypeScript with Pinecone semantic search, GPT-4o and LLaMA 3 on vLLM, deployed on clients\u2019 own machines behind a private VPN so data never leaves the network.',
    stack: ['Node.js', 'TypeScript', 'Pinecone', 'GPT-4o', 'LLaMA 3 · vLLM', 'React'],
    link: 'https://github.com/umasenthil2214/uma-thruliquid-PrivateAI',
  },
  {
    tag: 'Levven Electronics · Device protocols · 2021–24',
    title: 'Levven',
    em: 'Controls',
    desc: 'Control app for lights, dimmers and fans that talks to devices over BLE and local Wi-Fi sockets at home and fails over to AWS cloud when away. Defined BLE and gateway protocols with the firmware team and shipped OTA gateway updates with validation and error recovery.',
    stack: ['BLE', 'Wi-Fi Sockets', 'OTA Updates', 'AWS', 'Flutter', 'Kotlin'],
    link: 'https://apps.apple.com/ca/app/levven-controls/id1436898660',
  },
];

/* Rises as light towers. Values are taken directly from the résumé. */
export const STATS = [
  { label: 'Years building software', value: 15, suffix: '+', h: 4.6 },
  { label: 'Companies', value: 8, suffix: '', h: 3.2 },
  { label: 'Validation tests automated', value: 10, suffix: '', h: 3.8 },
  { label: 'SOS acknowledgement', value: 100, prefix: '<', suffix: 'ms', h: 2.4 },
];

export const HONORS = [
  { big: 'Demonstrated to the Red Cross', small: 'FASTER disaster-shelter system · DBTech' },
  { big: 'SOS acknowledged in under 100 ms', small: 'BLE Mesh command / acknowledge · DBTech' },
];

/* The corridor: one lit doorway per role, newest first */
export const JOURNEY = [
  { year: '2026', role: 'Senior Embedded Firmware & Mobile Engineer', place: 'DBTech · Texas (remote)', note: '2026 — present · Firmware, protocols & telemetry for FASTER', tech: ['C · STM32WB55', 'BLE Mesh', 'Bootloader · OTA', 'Bring-up & DVT', 'Python Test Kits'] },
  { year: '2026', role: 'Red Cross Disaster Project', place: 'DBTech · FASTER · demonstrated to the Red Cross', note: 'Indoor disaster shelters · band setup at reception · RSSI tracking', tech: ['USB Dongle', 'Local Bridge App', 'BLE Provisioning', 'RSSI Tracking'] },
  { year: '2024', role: 'Senior Mobile Developer & AI Consultant', place: 'ThruLiquid Inc · Mississauga', note: '2024 — 2026 · Private, on-premise AI · real-time data clients', tech: ['RAG', 'Pinecone', 'LLaMA 3 · vLLM', 'On-prem · VPN', 'WebSockets'] },
  { year: '2021', role: 'Senior Mobile Application Developer', place: 'Levven Electronics · Edmonton', note: '2021 — 2024 · BLE & gateway protocols · OTA · mentoring', tech: ['BLE', 'Wi-Fi Sockets', 'OTA Updates', 'AWS Fail-over', 'Flutter · Kotlin'] },
  { year: '2019', role: 'Senior Android Developer — Security & NFC', place: 'Elsi Inc (Stash) · Edmonton', note: '2019 — 2021 · Hardware-backed, offline password manager', tech: ['NFC', 'AES · RSA', 'SHA-256', 'Air-gapped Storage', 'Pen Testing'] },
  { year: '2018', role: 'Senior Mobile Developer', place: 'ThruLiquid Inc · Toronto', note: '2018 · Android, iOS & web apps', tech: ['Ionic', 'React', 'Node.js', 'REST APIs'] },
];

/* Orbiting cards: products built across the career */
export const BUILDS = [
  ['DBTech · 2026', 'Red Cross Disaster Project'],
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
