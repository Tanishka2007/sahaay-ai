/**
 * SAHAAY // THE FUTURE OF AI & AUTOMATION (2040 EDITION)
 * Core Neural Controller, Leaflet Live AI Radar, Predictive Ripple Effect Engine,
 * Client Profile Auto-Injection, Google Maps Deep-Linking & Automated SOS.
 */

// ============================================================================
// 1. STATE & STORAGE
// ============================================================================
let activeView = "radar";
let activeDomain = "medical";
let userCoords = { lat: 18.5204, lng: 73.8567 }; // Default fallback coordinates
let leafletMap = null;
let mapMarkers = { alerts: [], hospitals: [], user: null };
let isVoiceRecording = false;
let speechRecognizer = null;

// Client Profile State (persisted in localStorage)
let clientProfile = {
  name: "Ramesh Verma",
  blood_type: "O+",
  emergency_contact: "+91-98220-44911",
  allergies: "SEVERE ANAPHYLACTIC SHOCK TO PENICILLIN & AMOXICILLIN",
  medical_history: "Prior coronary stent in LAD (2020), Hypertension, Atorvastatin 40mg, Metoprolol 25mg daily."
};

// ============================================================================
// 2. DOMAIN DEFINITIONS & PRESET CHAOS SCENARIOS
// ============================================================================
const DOMAINS = {
  medical: {
    categoryPill: "🧬 MEDICAL AI TRIAGE CORE",
    viewHeading: "Acute Symptoms & History Triage",
    viewTagline: "Ingest chaotic emergency transcripts and messy prescription notes. Convert into verified clinical triage with 2nd and 3rd order ripple prediction.",
    primaryLabel: "Audio Transcript / Panicked Symptoms",
    primaryPlaceholder: "Paste panicked caller audio transcript, emergency symptoms, or vitals reading...",
    primaryHint: "Accepts chaotic descriptions, conversational panic, or live voice recording.",
    contextLabel: "Context / Telemetry / Medications",
    contextPlaceholder: "Past clinical diagnoses, daily medications, severe drug allergies...",
    contextHint: "Client Profile is auto-injected; additional clinic notes can be added here.",
    presetLabel: "Load Cardiac + Anaphylaxis Scenario",
    preset: {
      raw: `[EMERGENCY 911 CALL RECORDING - 04:12 AM]:
"Please send an ambulance quickly to Sector 14, Flat 3B near Sacred Heart Hospital! My 68-year-old father collapsed onto the floor clutching his chest! He's sweating cold, skin is pale, he's gasping for breath! We took his vitals on our home monitor: heart rate is 134 bpm, BP reading says 82 over 50, pulse ox says 86%! He's drifting in and out of consciousness!"`,
      context: `[HANDWRITTEN CLINIC DISCHARGE NOTE]:
Patient: Ramesh Verma (68M). Prior drug allergy: SEVERE ANAPHYLACTIC SHOCK TO PENICILLIN & AMOXICILLIN (throat closure in 2021). Medications: Atorvastatin 40mg, Metoprolol 25mg daily. Prior coronary stent in LAD (2020).`
    }
  },

  traffic: {
    categoryPill: "🛰️ TRAFFIC & INFRASTRUCTURE CORE",
    viewHeading: "Roadway Hazard & Geo-Anchor Engine",
    viewTagline: "Extract standardized GPS coordinates from colloquial landmarks, evaluate blockage severity, and predict cascading traffic gridlock.",
    primaryLabel: "Colloquial Location / Landmarks",
    primaryPlaceholder: "e.g. 'Near the big yellow overhead water tank just past the toll plaza on the old highway...'",
    primaryHint: "Vague descriptions, local landmarks, or nearby shop names.",
    contextLabel: "Hazard Description & Telemetry",
    contextPlaceholder: "e.g. 'High voltage power pole snapped across both lanes, sparking water puddles, truck turned sideways...'",
    contextHint: "Physical infrastructure damage, fallen utility lines, or hazardous spills.",
    presetLabel: "Load Downed Cables & Highway Sinkhole",
    preset: {
      raw: `[VOICE NOTE FROM STRANDED MOTORIST]:
"Major emergency on the old Pune-Mumbai highway! Just 500 meters after the Old Toll Plaza near the Sector 14 flyover, right beside the Bharat Petroleum pump, three vehicles collided because a huge municipal high-tension electric transmission cable snapped in the storm and fell right across both lanes! Sparks are flying into the flooded road bed, hundreds of cars are backing up!"`,
      context: `Municipal Traffic Telemetry: Highway Corridor 4B arterial status red. CCTV camera node 104 power loss. Transit feeder bus lines 12 & 14 delayed.`
    }
  },

  climate: {
    categoryPill: "⛈️ CLIMATE & DISASTER DEFENSE",
    viewHeading: "Disaster Inundation & Conflict Detector",
    viewTagline: "Correlate chaotic citizen reports against physical sensor & SCADA telemetry to detect discrepancies and issue evacuation orders.",
    primaryLabel: "Messy Local Disaster Observations",
    primaryPlaceholder: "e.g. 'River is overflowing our boundary walls, people are trapped on roofs near the causeway...'",
    primaryHint: "Civilian flood reports, structural crack sightings, or ground observations.",
    contextLabel: "Simulated Weather / Radar Sensor Feed",
    contextPlaceholder: "e.g. 'Hydro-Gauge S-12: River level 1.8m above danger mark. IMD: 48mm/hr rain.'",
    contextHint: "Official telemetry, dam spillway sensor logs, or hydro-gauges.",
    presetLabel: "Load Dam Rumor vs. SCADA Contradiction",
    preset: {
      raw: `[VIRAL AUDIO FORWARD - 11:20 AM]:
"EMERGENCY RUN NOW! The Khopoli main dam wall has cracked open, all 12 sluice gates have broken off! The bypass highway bridge is totally washed away, hundreds of families swept into the river! Evacuate to the mountains immediately!"`,
      context: `Irrigation Department SCADA Telemetry (Khopoli Dam): All 4 radial gates are 100% closed, spillway discharge is 0 cumecs, water level is 4.1m below crest. PWD Accelerometer Sensor: Bridge structural resonance 2.2Hz, zero deformation.`
    }
  },

  others: {
    categoryPill: "❓ CUSTOM AI TRIAGE CORE",
    viewHeading: "Autonomous Open Problem Triage",
    viewTagline: "Describe any unlisted critical hazard or emergency. Sahaay AI will autonomously categorize, assess risks, and dispatch directives.",
    primaryLabel: "Problem / Incident Description",
    primaryPlaceholder: "Describe the situation in detail: what happened, any chemical odors, people trapped, or unique circumstances...",
    primaryHint: "Industrial accidents, strange chemical leaks, missing persons, or structural failures.",
    contextLabel: "Additional Background Context",
    contextPlaceholder: "Nearby hazardous facilities, weather conditions, or secondary observations...",
    contextHint: "Any supporting technical or environmental facts.",
    presetLabel: "Load Toxic Chemical Vapor Leak Scenario",
    preset: {
      raw: `[URGENT REPORT - COMMUNITY WARDEN]:
"We are at the municipal industrial fringe near Rail Siding 4. A large unmarked pressurized tank car is hissing loudly with a bright yellow-green vapor cloud drifting toward the residential colony! People are coughing uncontrollably, eyes burning, birds dropping from trees! About 40 families are within 200 meters!"`,
      context: `Industrial SCADA Alarm: Chlorine/Ammonia pressurized bulk storage depot perimeter alert. Wind direction: South-Southwest at 14 knots.`
    }
  }
};

// ============================================================================
// 3. HOSPITALS DIRECTORY WITH LIVE CAPACITY & UNSPLASH IMAGES
// ============================================================================
const HOSPITALS = [
  {
    id: "hosp-1",
    name: "Sacred Heart Super-Specialty",
    distance: "1.4 km",
    driveTime: "4 mins",
    coords: { lat: 18.5284, lng: 73.8739 },
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&auto=format&fit=crop&q=80",
    capacity: "82% Capacity (4 ICU Beds Available)",
    brief: "Level 1 Emergency Trauma Unit. Stroke protocol active. Helipad operational. Cardiothoracic surgeon on active standby.",
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&destination=18.5284,73.8739"
  },
  {
    id: "hosp-2",
    name: "Ruby Hall Emergency Center",
    distance: "2.8 km",
    driveTime: "8 mins",
    coords: { lat: 18.5312, lng: 73.8781 },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&fit=crop&q=80",
    capacity: "64% Capacity (9 ICU Beds Available)",
    brief: "Negative-pressure containment suites. On-site cryogenic oxygen storage at 100%. Advanced neuro-resuscitation bay.",
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&destination=18.5312,73.8781"
  },
  {
    id: "hosp-3",
    name: "Apollo Command Hospital",
    distance: "4.1 km",
    driveTime: "11 mins",
    coords: { lat: 18.5089, lng: 73.8345 },
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&auto=format&fit=crop&q=80",
    capacity: "91% Surge Alert (2 Burn Units Available)",
    brief: "Specialized hazardous burns, toxic vapor inhalation, and hyperbaric trauma facility. O-Negative blood bank primed.",
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&destination=18.5089,73.8345"
  }
];

// Simulated Live Radar Pulsing Incidents
const RADAR_ALERTS = [
  {
    id: "alert-1",
    title: "Highway 9 Overpass Multi-Car Collision",
    type: "Traffic & High-Tension Cable",
    severity: "CRITICAL",
    coords: { lat: 18.5204, lng: 73.8567 },
    detail: "High-tension 11kV cable snapped across roadway. Sparks in standing water. Traffic gridlock extending 1.8km."
  },
  {
    id: "alert-2",
    title: "Sector 14 Storm Inundation Surge",
    type: "Flash Flood Surge (1.8m)",
    severity: "HIGH",
    coords: { lat: 18.5420, lng: 73.8410 },
    detail: "Stormwater causeway breached. 32 residential compounds experiencing ground-floor water ingress."
  },
  {
    id: "alert-3",
    title: "Industrial Rail Siding Chemical Plume",
    type: "Toxic Gas Hazard",
    severity: "CRITICAL",
    coords: { lat: 18.4980, lng: 73.8650 },
    detail: "Pressurized tank vapor drift moving south-southwest at 14 knots. Pre-evacuation perimeter established."
  }
];

// ============================================================================
// 4. MULTI-LANGUAGE TRANSLATION DICTIONARY (EN, HI, MR, TA, GU)
// ============================================================================
const TRANSLATIONS = {
  en: {
    brand_title: "SAHAAY",
    brand_subtitle: "AI TRIAGE BRIDGE // 2040",
    portal_exit: "Return to Main Portal",
    nav_radar: "Live AI Radar",
    nav_profile: "Client Profile",
    nav_medical: "Medical AI Triage",
    nav_traffic: "Traffic & Infrastructure",
    nav_climate: "Climate & Disasters",
    nav_others: "Others (Custom Triage)",
    nav_sos: "SOS / Emergency",
    nav_faq: "Help / FAQ / Contact",
    lang_label: "🌐 LANGUAGE",
    status_active: "GEMINI 2.5 FLASH ACTIVE",
    radar_pill: "📡 LIVE ORBITAL & GROUND RADAR",
    radar_heading: "Autonomous Disaster & Infrastructure Radar",
    radar_tagline: "Real-time spatial telemetry overlaying pulsing disaster alerts, traffic collapses, and hospital bed capacities with predictive routing corridors.",
    btn_radar_recenter: "Lock User GPS",
    stat_active_alerts: "Pulsing Red Alerts",
    stat_hospitals_online: "Connected Hospitals",
    stat_ripple_status: "Ripple Engine Status",
    filter_all: "All Entities",
    filter_alerts: "🚨 Pulsing Alerts",
    filter_hospitals: "🏥 Hospitals",
    profile_pill: "👤 PROFILE SYNCHRONIZATION",
    profile_heading: "Civilian Neural Health Profile",
    profile_tagline: "Your profile is automatically stored locally and injected into all AI triage requests to prevent lethal drug contraindications and ensure zero-delay identification.",
    prof_name_label: "Full Legal Name",
    prof_blood_label: "Blood Type",
    prof_contact_label: "Emergency Contact Phone (Next-of-Kin)",
    prof_allergies_label: "Known Drug Allergies & Contraindications",
    prof_history_label: "Chronic Medical History & Daily Medications",
    btn_save_profile: "💾 SAVE & AUTO-INJECT PROFILE",
    profile_synced_msg: "✓ Synced to Neural Cache",
    preset_btn_label: "Load Chaos Scenario",
    ingest_step: "01 // INGESTION",
    ingest_title: "Unstructured Human Signal",
    sensors_label: "SENSORS:",
    sensor_voice: "🎙️ Voice SOS",
    sensor_cam: "📷 Camera",
    sensor_gps: "📍 GPS Lock",
    voice_wave_text: "Acoustic stream active... Transcribing panicked distress audio",
    image_sub: "Visual feed staged for Gemini multimodal verification",
    injected_profile_prefix: "Auto-Injecting Profile:",
    btn_orchestrate_text: "SYNTHESIZE & DISPATCH ACTIONS",
    output_step: "02 // AUTONOMOUS SYNTHESIS",
    output_title: "Civilian & Command Views",
    standby_heading: "Awaiting Incident Stream",
    standby_detail: "Select an AI core on the left dock, attach live voice/photo inputs or load a preset, then trigger quantum synthesis.",
    conflict_title: "DISCREPANCY / CONTRAINDICATION DETECTED",
    ripple_title: "PREDICTIVE RIPPLE EFFECT ENGINE",
    ripple_subtitle: "Autonomous 2nd & 3rd Order Cascading Incident Projection",
    civilian_title: "Civilian View",
    civilian_subtitle: "3 Immediate Jargon-Free Survival Directives",
    maps_action_text: "NAVIGATE TO NEAREST EMERGENCY HOSPITAL (GOOGLE MAPS)",
    traffic_action_text: "VIEW ALTERNATE BYPASS ROUTE (GOOGLE MAPS)",
    climate_action_text: "NAVIGATE TO HIGH RIDGE EVACUATION SHELTER (GOOGLE MAPS)",
    custom_action_text: "VIEW HAZARD CONTAINMENT CORRIDOR (GOOGLE MAPS)",
    hospitals_title: "Triangulated Coordinates & Hospital Directory",
    traffic_title: "Triangulated Corridors & Alternate Bypass Routing",
    climate_title: "Evacuation Assembly Points & Hydro-Sensor Status",
    custom_title: "Hazard Containment Zone & Critical Response",
    satellite_sync_badge: "SATELLITE SYNC",
    command_title: "Command Dispatch View",
    command_subtitle: "Autonomous Incident Manifest & Auditable Evidence Ledger",
    sos_pill: "🚨 CRITICAL EMERGENCY OVERRIDE",
    sos_heading: "High-Alert Automated SOS Dispatch",
    sos_tagline: "One-click automated beacon that packages your live GPS coordinates, medical history, and blood type directly to national dispatch infrastructure.",
    beacon_title: "TRIGGER INSTANT SOS DISPATCH",
    beacon_desc: "Simulate sending live GPS + Profile to 112 Command",
    beacon_sent_strong: "SOS BEACON TRANSMITTED:",
    direct_routing_title: "Direct Emergency Routing",
    direct_routing_desc: "Deep-link to nearest safety installations using satellite GPS:",
    route_police: "🚔 Route to Nearest Police Station",
    route_hosp: "🏥 Route to Nearest Hospital",
    speed_dial_title: "National Emergency Speed Dial",
    dial_112_name: "Unified Emergency Services",
    dial_108_name: "Ambulance & Medical Emergency",
    dial_100_name: "Police Dispatch Center",
    dial_101_name: "Fire & Rescue Service",
    faq_pill: "ℹ️ SYSTEM DOCUMENTATION & TELEMETRY",
    faq_heading: "Help, System Architecture & Contact",
    faq_tagline: "How Sahaay bridges chaotic human intent with deterministic 2040 emergency systems.",
    faq_deck_title: "Frequently Asked Questions",
    faq_q1: "What is Sahaay: Universal Triage Bridge?",
    faq_a1: "Sahaay is an autonomous emergency automation engine powered by Google Gemini 2.5 Flash. It ingests messy voice transcripts, disaster reports, and physical sensor telemetry to produce verified civilian directives and structured CAD/FHIR dispatch manifests.",
    faq_q_ripple: "What is the Predictive Ripple Effect Engine?",
    faq_a_ripple: "Whenever an emergency is decoded, Sahaay predicts 2nd and 3rd order impacts (e.g. traffic blockage delaying ambulances to City Hospital, cascading hospital ICU bed saturation) and autonomously executes mitigations before bottlenecks occur.",
    faq_q2: "How does Client Profile Injection work?",
    faq_a2: "Your saved profile (blood group, chronic conditions, and lethal allergies like Penicillin) is automatically attached to backend triage payloads so the AI cross-verifies medication contraindications before first responders arrive.",
    faq_q3: "What is Conflict Detection?",
    faq_a3: "When citizen panic contradicts physical reality (e.g. viral rumors claiming a dam collapsed while SCADA sensors report closed radial gates), the engine flags a discrepancy and enforces a fail-closed safety priority.",
    contact_hub_title: "Official Architecture Hub",
    contact_email_label_card: "OFFICIAL SYSTEM EMAIL",
    contact_hq_label: "HEADQUARTERS",
    contact_hq_val: "Sahaay Emergency AI Operations, Sector 14 Innovation Corridor",
    contact_uptime_label: "TELEMETRY UPTIME",
    contact_uptime_val: "99.998% High Availability",
    contact_enc_label: "ENCRYPTION PROTOCOL",
    contact_enc_val: "Quantum-Resistant SHA-256 Mesh",
    contact_form_title: "Quick Dispatch Inquiries",
    contact_btn_text: "TRANSMIT MESSAGE",
    contact_status_msg: "✓ Message queued to system@sahaay-ai.com",
    locate_radar_btn: "📍 LOCATE INCIDENT ON AI RADAR"
  },

  hi: {
    brand_title: "सहाय",
    brand_subtitle: "एआई ट्रायज ब्रिज // 2040",
    portal_exit: "मुख्य पोर्टल पर लौटें",
    nav_radar: "लाइव एआई रडार",
    nav_profile: "यूजर प्रोफाइल",
    nav_medical: "मेडिकल एआई ट्रायज",
    nav_traffic: "ट्रैफिक व इंफ्रास्ट्रक्चर",
    nav_climate: "जलवायु व आपदाएं",
    nav_others: "अन्य (कस्टम ट्रायज)",
    nav_sos: "आपातकालीन SOS",
    nav_faq: "सहायता व संपर्क",
    lang_label: "🌐 भाषा चुनें",
    status_active: "जेमिनी 2.5 फ्लैश सक्रिय",
    radar_pill: "📡 लाइव ऑर्बिटल व ग्राउंड रडार",
    radar_heading: "स्वायत्त आपदा व इंफ्रास्ट्रक्चर रडार",
    radar_tagline: "वास्तविक समय में आपदा अलर्ट, ट्रैफिक व्यवधान और अस्पताल बेड क्षमता का लाइव मानचित्र।",
    btn_radar_recenter: "जीपीएस लॉक करें",
    stat_active_alerts: "सक्रिय रेड अलर्ट",
    stat_hospitals_online: "जुड़े हुए अस्पताल",
    stat_ripple_status: "रिपल इंजन स्थिति",
    filter_all: "सभी संस्थाएं",
    filter_alerts: "🚨 सक्रिय अलर्ट",
    filter_hospitals: "🏥 अस्पताल",
    profile_pill: "👤 प्रोफाइल सिंक्रनाइज़ेशन",
    profile_heading: "नागरिक स्वास्थ्य प्रोफाइल",
    profile_tagline: "आपकी प्रोफ़ाइल स्वतः सभी ट्रायज अनुरोधों में इंजेक्ट की जाती है ताकि एलर्जी से सुरक्षा सुनिश्चित हो सके।",
    prof_name_label: "पूरा कानूनी नाम",
    prof_blood_label: "रक्त समूह",
    prof_contact_label: "आपातकालीन संपर्क (फोन)",
    prof_allergies_label: "दवा एलर्जी और प्रतिबंध",
    prof_history_label: "पुरानी बीमारी का इतिहास व दैनिक दवाएं",
    btn_save_profile: "💾 प्रोफाइल सहेजें",
    profile_synced_msg: "✓ प्रोफाइल सुरक्षित व सिंक हो गई",
    preset_btn_label: "आपात परिदृश्य लोड करें",
    ingest_step: "01 // इनपुट",
    ingest_title: "असंरचित मानव संदेश",
    sensors_label: "सेंसर उपकरण:",
    sensor_voice: "🎙️ वॉयस SOS",
    sensor_cam: "📷 कैमरा फोटो",
    sensor_gps: "📍 जीपीएस लॉक",
    voice_wave_text: "ध्वनि स्ट्रीम सक्रिय... आवाज ट्रांसक्राइब हो रही है",
    image_sub: "मल्टीमॉडल सत्यापन हेतु फोटो संलग्न",
    injected_profile_prefix: "स्वतः इंजेक्ट प्रोफाइल:",
    btn_orchestrate_text: "विश्लेषण करें व त्वरित सहायता भेजें",
    output_step: "02 // स्वायत्त संश्लेषण",
    output_title: "नागरिक व नियंत्रण कक्ष दृश्य",
    standby_heading: "इनपुट की प्रतीक्षा है",
    standby_detail: "बाएं मेनू से विकल्प चुनें, वॉयस या टेक्स्ट इनपुट दें और विश्लेषण शुरू करें।",
    conflict_title: "विसंगति / परस्पर विरोधी जानकारी चिन्हित",
    ripple_title: "पूर्वानुमानित रिपल प्रभाव इंजन",
    ripple_subtitle: "स्वायत्त द्वितीय व तृतीय स्तरीय दुष्प्रभाव का आकलन",
    civilian_title: "नागरिक दृश्य",
    civilian_subtitle: "तुरंत बचाव के लिए 3 सरल कदम",
    maps_action_text: "निकटतम आपातकालीन अस्पताल का मार्ग (गूगल मैप्स)",
    traffic_action_text: "वैकल्पिक बाईपास मार्ग देखें (गूगल मैप्स)",
    climate_action_text: "उच्च रिज राहत शिविर का मार्ग (गूगल मैप्स)",
    custom_action_text: "खतरा नियंत्रण क्षेत्र मार्ग देखें (गूगल मैप्स)",
    hospitals_title: "स्थान निर्देशांक व अस्पताल निर्देशिका",
    traffic_title: "ट्रैफिक बाईपास गलियारे व डायवर्जन निर्देशिका",
    climate_title: "निकासी केंद्र व जल स्तर सेंसर स्थिति",
    custom_title: "खतरा नियंत्रण क्षेत्र व आपात प्रतिक्रिया",
    satellite_sync_badge: "सैटेलाइट सिंक",
    command_title: "डिस्पैच कमांड दृश्य",
    command_subtitle: "घटना विवरण व साक्ष्य तालिका",
    sos_pill: "🚨 आपातकालीन अलर्ट ओवरराइड",
    sos_heading: "उच्च-अलर्ट स्वचालित SOS डिस्पैच",
    sos_tagline: "एक क्लिक में अपना जीपीएस और मेडिकल प्रोफाइल राष्ट्रीय आपात सेवा को प्रसारित करें।",
    beacon_title: "तत्काल SOS सक्रिय करें",
    beacon_desc: "112 कमांड को लाइव जीपीएस + प्रोफाइल भेजें",
    beacon_sent_strong: "SOS संकेत प्रसारित हुआ:",
    direct_routing_title: "सीधा आपातकालीन मार्ग",
    direct_routing_desc: "सैटेलाइट जीपीएस के जरिए निकटतम सुरक्षा केंद्रों का सीधा मार्ग:",
    route_police: "🚔 निकटतम पुलिस स्टेशन का रास्ता",
    route_hosp: "🏥 निकटतम अस्पताल का रास्ता",
    speed_dial_title: "राष्ट्रीय आपातकालीन नंबर",
    dial_112_name: "एकीकृत आपातकालीन सेवा",
    dial_108_name: "एम्बुलेंस व चिकित्सा सेवा",
    dial_100_name: "पुलिस नियंत्रण कक्ष",
    dial_101_name: "अग्निशमन व बचाव सेवा",
    faq_pill: "ℹ️ सिस्टम दस्तावेज़",
    faq_heading: "सहायता व आधिकारिक संपर्क",
    faq_tagline: "सहाय आपातकालीन परिस्थितियों में जटिल प्रणालियों को कैसे जोड़ता है।",
    faq_deck_title: "अक्सर पूछे जाने वाले प्रश्न",
    faq_q1: "सहाय क्या है?",
    faq_a1: "सहाय एक स्वायत्त आपातकालीन स्वचालन इंजन है जो गूगल जेमिनी 2.5 फ्लैश द्वारा संचालित है।",
    faq_q_ripple: "पूर्वानुमानित रिपल प्रभाव इंजन क्या है?",
    faq_a_ripple: "यह आपातकाल के दूसरे और तीसरे स्तर के प्रभावों का स्वतः अनुमान लगाकर रुकावट से पहले समाधान करता है।",
    faq_q2: "प्रोफाइल इंजेक्शन कैसे काम करता है?",
    faq_a2: "आपकी प्रोफ़ाइल (रक्त समूह, एलर्जी) स्वतः बैकएंड अनुरोधों में जुड़ जाती है।",
    faq_q3: "विसंगति पहचान (Conflict Detection) क्या है?",
    faq_a3: "जब नागरिक रिपोर्ट भौतिक सेंसर से मेल नहीं खाती, तो सिस्टम विसंगति ध्वजांकित करता है।",
    contact_hub_title: "आधिकारिक संपर्क केंद्र",
    contact_email_label_card: "आधिकारिक सिस्टम ईमेल",
    contact_hq_label: "मुख्यालय",
    contact_hq_val: "सहाय आपातकालीन एआई संचालन, सेक्टर 14",
    contact_uptime_label: "सिस्टम अपटाइम",
    contact_uptime_val: "99.998% उच्च उपलब्धता",
    contact_enc_label: "सुरक्षा प्रोटोकॉल",
    contact_enc_val: "क्वांटम-प्रतिरोधी एन्क्रिप्शन",
    contact_form_title: "त्वरित संपर्क पूछताछ",
    contact_btn_text: "संदेश भेजें",
    contact_status_msg: "✓ संदेश system@sahaay-ai.com पर कतारबद्ध किया गया",
    locate_radar_btn: "📍 रडार पर घटना का स्थान देखें"
  },

  mr: {
    brand_title: "सहाय",
    brand_subtitle: "एआय ट्रायज ब्रिज // 2040",
    portal_exit: "मुख्य पोर्टलवर परत जा",
    nav_radar: "थेट एआय रडार",
    nav_profile: "वापरकर्ता प्रोफाइल",
    nav_medical: "वैद्यकीय ट्रायज",
    nav_traffic: "वाहतूक व पायाभूत सुविधा",
    nav_climate: "हवामान व आपत्ती",
    nav_others: "इतर समस्या",
    nav_sos: "तातडीची मदत (SOS)",
    nav_faq: "मदत व संपर्क",
    lang_label: "🌐 भाषा",
    status_active: "जेमिनी २.५ फ्लॅश सक्रिय",
    radar_pill: "📡 थेट उपग्रह व भूपृष्ठ रडार",
    radar_heading: "स्वायत्त आपत्ती व वाहतूक रडार",
    radar_tagline: "अपघात, पूर आणि रुग्णालयातील खाटांच्या उपलब्धतेचा थेट डिजिटल नकाशा.",
    btn_radar_recenter: "जीपीएस लॉक करा",
    stat_active_alerts: "सक्रिय धोके",
    stat_hospitals_online: "जोडलेली रुग्णालये",
    stat_ripple_status: "रिपल प्रभाव इंजिन",
    filter_all: "सर्व घटक",
    filter_alerts: "🚨 धोक्याचे इशारे",
    filter_hospitals: "🏥 रुग्णालये",
    profile_pill: "👤 प्रोफाइल सिंक",
    profile_heading: "नागरिक आरोग्य माहिती",
    profile_tagline: "लक्षात ठेवा, ही माहिती थेट डॉक्टरांकडे पाठवली जाते जेणेकरून चुकीचे औषध दिले जाणार नाही.",
    prof_name_label: "पूर्ण नाव",
    prof_blood_label: "रक्तगट",
    prof_contact_label: "आपत्कालीन फोन नंबर",
    prof_allergies_label: "औषधांची ॲलर्जी",
    prof_history_label: "मागील आजार व रोजची औषधे",
    btn_save_profile: "💾 प्रोफाइल जतन करा",
    profile_synced_msg: "✓ प्रोफाइल सुरक्षित जतन झाली",
    preset_btn_label: "आपत्कालीन उदाहरण भरा",
    ingest_step: "01 // माहिती नोंदवा",
    ingest_title: "नागरिकांचा संदेश",
    sensors_label: "सेंसर साधने:",
    sensor_voice: "🎙️ व्हॉईस SOS",
    sensor_cam: "📷 कॅमेरा फोटो",
    sensor_gps: "📍 जीपीएस स्थान",
    voice_wave_text: "आवाज नोंदवणे सुरू आहे...",
    image_sub: "तपासासाठी छायाचित्र जोडले आहे",
    injected_profile_prefix: "जोडलेली प्रोफाइल:",
    btn_orchestrate_text: "विश्लेषण करा व मदत पाठवा",
    output_step: "02 // स्वायत्त उपाययोजना",
    output_title: "नागरी व नियंत्रण कक्ष माहिती",
    standby_heading: "संदेशाची प्रतीक्षा आहे",
    standby_detail: "डाव्या बाजूने पर्याय निवडा, माहिती टाका आणि विश्लेषण सुरू करा.",
    conflict_title: "माहितीत विसंगती आढळली",
    ripple_title: "भविष्यकालीन रिपल प्रभाव इंजिन",
    ripple_subtitle: "दुसऱ्या व तिसऱ्या टप्प्यातील परिणामांचे स्वयंचलित अंदाज",
    civilian_title: "नागरिकांसाठी सूचना",
    civilian_subtitle: "तातडीने करावयाच्या ३ महत्त्वाच्या कृती",
    maps_action_text: "जवळच्या रुग्णालयाचा मार्ग (Google Maps)",
    traffic_action_text: "पर्यायी वळण रस्ता पहा (Google Maps)",
    climate_action_text: "सुरक्षित निवारा केंद्राचा मार्ग (Google Maps)",
    custom_action_text: "धोका नियंत्रण मार्ग (Google Maps)",
    hospitals_title: "रुग्णालय सूची व जीपीएस स्थान",
    traffic_title: "वाहतूक वळण मार्ग व थेट अडथळा सूची",
    climate_title: "सुरक्षित निवारा केंद्र व पूर सेन्सर नोंद",
    custom_title: "धोका नियंत्रण कक्ष व तातडीची मदत",
    satellite_sync_badge: "उपग्रह जोडणी",
    command_title: "नियंत्रण कक्ष माहिती",
    command_subtitle: "सविस्तर तांत्रिक नोंद",
    sos_pill: "🚨 आणीबाणी सूचना",
    sos_heading: "स्वयंचलित तातडीचा SOS संदेश",
    sos_tagline: "एका क्लिकवर तुमचे जीपीएस आणि औषधोपचार माहिती ११२ नियंत्रण कक्षाला पाठवा.",
    beacon_title: "तातडीचा SOS पाठवा",
    beacon_desc: "११२ मुख्यालयाला थेट संदेश पाठवा",
    beacon_sent_strong: "SOS संदेश पाठवला गेला:",
    direct_routing_title: "थेट मार्गदर्शक",
    direct_routing_desc: "जीपीएस द्वारे जवळच्या केंद्रांचा नकाशा मिळवा:",
    route_police: "🚔 जवळच्या पोलीस ठाण्याचा मार्ग",
    route_hosp: "🏥 जवळच्या रुग्णालयाचा मार्ग",
    speed_dial_title: "तातडीचे फोन नंबर",
    dial_112_name: "एकात्मिक आणीबाणी सेवा",
    dial_108_name: "रुग्णवाहिका सेवा",
    dial_100_name: "पोलीस नियंत्रण कक्ष",
    dial_101_name: "अग्निशामक दल",
    faq_pill: "ℹ️ माहिती व संपर्क",
    faq_heading: "मदत व तांत्रिक संपर्क",
    faq_tagline: "सहाय प्रणाली आपत्ती व्यवस्थापनात कशी कार्य करते.",
    faq_deck_title: "वारंवार विचारले जाणारे प्रश्न",
    faq_q1: "सहाय म्हणजे काय?",
    faq_a1: "सहाय ही गुगल जेमिनी २.५ द्वारे चालवली जाणारी एक आधुनिक आपत्कालीन प्रणाली आहे.",
    faq_q_ripple: "रिपल प्रभाव इंजिन काय आहे?",
    faq_a_ripple: "हे आपत्तीमुळे होणाऱ्या दुय्यम वाहतूक व वैद्यकीय अडचणींचा अगोदरच अंदाज घेते.",
    faq_q2: "प्रोफाइल कशी जोडली जाते?",
    faq_a2: "तुमची रक्तगट व ॲलर्जीची माहिती आपत्कालीन कॉलसोबत थेट डॉक्टरांकडे जाते.",
    faq_q3: "माहिती विसंगती कशी तपासली जाते?",
    faq_a3: "नागरिकांच्या अफवा आणि सेन्सरमधील फरक प्रणाली त्वरित स्पष्ट करते.",
    contact_hub_title: "अधिकृत केंद्र",
    contact_email_label_card: "अधिकृत ईमेल",
    contact_hq_label: "मुख्यालय",
    contact_hq_val: "सहाय इमर्जन्सी ऑपरेशन्स, सेक्टर १४",
    contact_uptime_label: "सिस्टम उपलब्धता",
    contact_uptime_val: "९९.९९८% अखंड सेवा",
    contact_enc_label: "सुरक्षा",
    contact_enc_val: "क्वांटम सुरक्षित कूटबद्धीकरण",
    contact_form_title: "तातडीची संपर्क विचारणा",
    contact_btn_text: "संदेश पाठवा",
    contact_status_msg: "✓ संदेश पाठवला गेला आहे",
    locate_radar_btn: "📍 रडारवर अपघात पहा"
  },

  ta: {
    brand_title: "சஹாய்",
    brand_subtitle: "AI டிரைஜ் பிரிட்ஜ் // 2040",
    portal_exit: "முதன்மை போர்ட்டலுக்கு திரும்பு",
    nav_radar: "நேரலை AI ரேடார்",
    nav_profile: "சுயவிவரம்",
    nav_medical: "மருத்துவ டிரைஜ்",
    nav_traffic: "போக்குவரத்து & உள்கட்டமைப்பு",
    nav_climate: "வானிலை & பேரிடர்",
    nav_others: "இதர அவசரங்கள்",
    nav_sos: "SOS அவசரம்",
    nav_faq: "உதவி & தொடர்பு",
    lang_label: "🌐 மொழி",
    status_active: "ஜெமினி 2.5 செயலில் உள்ளது",
    radar_pill: "📡 நேரலை ரேடார்",
    radar_heading: "பேரிடர் மற்றும் உள்கட்டமைப்பு ரேடார்",
    radar_tagline: "விபத்துகள் மற்றும் மருத்துவமனை படுக்கை நிலவரங்களை நேரலையாக காட்டும் வரைபடம்.",
    btn_radar_recenter: "GPS ஐப் பூட்டவும்",
    stat_active_alerts: "செயலில் உள்ள எச்சரிக்கைகள்",
    stat_hospitals_online: "இணைக்கப்பட்ட மருத்துவமனைகள்",
    stat_ripple_status: "ரிப்பிள் எஞ்சின் நிலை",
    filter_all: "அனைத்தும்",
    filter_alerts: "🚨 விபத்துகள்",
    filter_hospitals: "🏥 மருத்துவமனைகள்",
    profile_pill: "👤 சுயவிவரம்",
    profile_heading: "மருத்துவ சுயவிவரம்",
    profile_tagline: "தவறான மருந்துகள் கொடுக்கப்படுவதைத் தடுக்க உங்கள் விவரங்கள் தானாகவே சேர்க்கப்படும்.",
    prof_name_label: "முழு பெயர்",
    prof_blood_label: "இரத்த வகை",
    prof_contact_label: "அவசர தொடர்பு எண்",
    prof_allergies_label: "மருந்து ஒவ்வாமை",
    prof_history_label: "மருத்துவ வரலாறு",
    btn_save_profile: "💾 சுயவிவரத்தை சேமிக்கவும்",
    profile_synced_msg: "✓ வெற்றிகரமாக சேமிக்கப்பட்டது",
    preset_btn_label: "மாதிரி தரவை ஏற்றவும்",
    ingest_step: "01 // தகவல் உள்ளீடு",
    ingest_title: "அவசர குரல் செய்தி",
    sensors_label: "கருவிகள்:",
    sensor_voice: "🎙️ குரல் SOS",
    sensor_cam: "📷 புகைப்படம்",
    sensor_gps: "📍 GPS",
    voice_wave_text: "குரல் பதிவு செயலில் உள்ளது...",
    image_sub: "ஆய்வுக்கு படம் இணைக்கப்பட்டுள்ளது",
    injected_profile_prefix: "சேர்க்கப்பட்ட சுயவிவரம்:",
    btn_orchestrate_text: "பகுப்பாய்வு செய்து அனுப்பவும்",
    output_step: "02 // பகுப்பாய்வு",
    output_title: "வழிகாட்டுதல்கள்",
    standby_heading: "செய்திக்காக காத்திருக்கிறது",
    standby_detail: "இடது மெனுவிலிருந்து தேர்ந்தெடுத்து உங்கள் செய்தியை உள்ளிடவும்.",
    conflict_title: "தகவல் முரண்பாடு கண்டறியப்பட்டது",
    ripple_title: "ரிப்பிள் விளைவு எஞ்சின்",
    ripple_subtitle: "தொடர் விளைவுகளின் முன்னறிவிப்பு",
    civilian_title: "உடனடி வழிகாட்டுதல்",
    civilian_subtitle: "உடனடியாக செய்ய வேண்டிய 3 படிகள்",
    maps_action_text: "அருகிலுள்ள மருத்துவமனைக்கு வழி (Google Maps)",
    traffic_action_text: "மாற்றுப்பாதையை காண்க (Google Maps)",
    climate_action_text: "பாதுகாப்பு முகாமுக்கு செல்லவும் (Google Maps)",
    custom_action_text: "பாதுகாப்பு பாதையை காண்க (Google Maps)",
    hospitals_title: "மருத்துவமனை அடைவு",
    traffic_title: "மாற்றுப்பாதை மற்றும் போக்குவரத்து அடைவு",
    climate_title: "வெள்ளப் பெருக்கு எச்சரிக்கை மையங்கள்",
    custom_title: "அபாய கட்டுப்பாட்டு மையம்",
    satellite_sync_badge: "செயற்கைக்கோள் இணைப்பு",
    command_title: "கட்டளை மைய பார்வை",
    command_subtitle: "ஆதாரங்களின் பட்டியல்",
    sos_pill: "🚨 அவசர உதவி",
    sos_heading: "தானியங்கி SOS அவசர அழைப்பு",
    sos_tagline: "உங்கள் இருப்பிடத்தையும் மருத்துவ தகவல்களையும் ஒரே கிளிக்கில் 112 மையத்திற்கு அனுப்பவும்.",
    beacon_title: "SOS ஐ இயக்கவும்",
    beacon_desc: "112 அவசர மையத்திற்கு அனுப்பவும்",
    beacon_sent_strong: "SOS அனுப்பப்பட்டது:",
    direct_routing_title: "நேரடி வழிசெலுத்தல்",
    direct_routing_desc: "GPS மூலம் அருகிலுள்ள மையங்களை அடையுங்கள்:",
    route_police: "🚔 அருகிலுள்ள காவல் நிலையம்",
    route_hosp: "🏥 அருகிலுள்ள மருத்துவமனை",
    speed_dial_title: "அவசர எண்கள்",
    dial_112_name: "ஒருங்கிணைந்த அவசர சேவை",
    dial_108_name: "ஆம்புலன்ஸ் சேவை",
    dial_100_name: "காவல்துறை",
    dial_101_name: "தீயணைப்பு படை",
    faq_pill: "ℹ️ உதவி",
    faq_heading: "உதவி மற்றும் தொடர்பு",
    faq_tagline: "சஹாய் எவ்வாறு செயல்படுகிறது.",
    faq_deck_title: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    faq_q1: "சஹாய் என்றால் என்ன?",
    faq_a1: "சஹாய் என்பது அவசரகால AI கட்டுப்பாட்டு அமைப்பாகும்.",
    faq_q_ripple: "ரிப்பிள் விளைவு என்றால் என்ன?",
    faq_a_ripple: "இது தொடர் போக்குவரத்து மற்றும் மருத்துவ தாமதங்களை முன்கூட்டியே கணிக்கிறது.",
    faq_q2: "சுயவிவரம் எவ்வாறு சேர்க்கப்படுகிறது?",
    faq_a2: "உங்கள் இரத்த வகை மற்றும் ஒவ்வாமை தகவல்கள் நேரடியாக இணைக்கப்படுகின்றன.",
    faq_q3: "முரண்பாடுகள் எவ்வாறு கண்டறியப்படுகின்றன?",
    faq_a3: "வதந்திகளையும் உண்மையான சென்சார் அளவுகளையும் ஒப்பிட்டு எச்சரிக்கிறது.",
    contact_hub_title: "அலுவலக மையம்",
    contact_email_label_card: "மின்னஞ்சல்",
    contact_hq_label: "தலைமையகம்",
    contact_hq_val: "சஹாய் அவசர AI மையம், செக்டார் 14",
    contact_uptime_label: "செயல்பாட்டு நேரம்",
    contact_uptime_val: "99.998%",
    contact_enc_label: "பாதுகாப்பு",
    contact_enc_val: "குவாண்டம் என்க்ரிப்ஷன்",
    contact_form_title: "விரைவு விசாரணை",
    contact_btn_text: "அனுப்பவும்",
    contact_status_msg: "✓ செய்தி அனுப்பப்பட்டது",
    locate_radar_btn: "📍 வரைபடத்தில் விபத்தை பார்க்கவும்"
  },

  gu: {
    brand_title: "સહાય",
    brand_subtitle: "AI ટ્રાયજ બ્રિજ // 2040",
    portal_exit: "મુખ્ય પોર્ટલ પર પાછા જાઓ",
    nav_radar: "લાઈવ AI રડાર",
    nav_profile: "ગ્રાહક પ્રોફાઇલ",
    nav_medical: "મેડિકલ ટ્રાયજ",
    nav_traffic: "ટ્રાફિક અને માળખાગત સુવિધા",
    nav_climate: "આબોહવા અને આપત્તિ",
    nav_others: "અન્ય કટોકટી",
    nav_sos: "ઇમર્જન્સી SOS",
    nav_faq: "મદદ અને સંપર્ક",
    lang_label: "🌐 ભાષા",
    status_active: "જેમિની 2.5 ફ્લેશ સક્રિય",
    radar_pill: "📡 લાઈવ રડાર",
    radar_heading: "આપત્તિ અને ટ્રાફિક રડાર",
    radar_tagline: "અકસ્માત અને હોસ્પિટલ બેડની ઉપલબ્ધતા દર્શાવતો લાઈવ નકશો.",
    btn_radar_recenter: "GPS લૉક કરો",
    stat_active_alerts: "સક્રિય એલર્ટ",
    stat_hospitals_online: "જોડાયેલ હોસ્પિટલો",
    stat_ripple_status: "રિપલ એન્જિન સ્થિતિ",
    filter_all: "બધા",
    filter_alerts: "🚨 એલર્ટ",
    filter_hospitals: "🏥 હોસ્પિટલો",
    profile_pill: "👤 પ્રોફાઇલ સિંક",
    profile_heading: "આરોગ્ય પ્રોફાઇલ",
    profile_tagline: "તમારી પ્રોફાઇલ આપમેળે મોકલવામાં આવે છે જેથી ખોટી દવા ન અપાય.",
    prof_name_label: "પૂરું નામ",
    prof_blood_label: "બ્લડ ગ્રુપ",
    prof_contact_label: "ઇમર્જન્સી ફોન નંબર",
    prof_allergies_label: "દવાની એલર્જી",
    prof_history_label: "બીમારીનો ઇતિહાસ",
    btn_save_profile: "💾 પ્રોફાઇલ સાચવો",
    profile_synced_msg: "✓ પ્રોફાઇલ સાચવવામાં આવી",
    preset_btn_label: "ઉદાહરણ લોડ કરો",
    ingest_step: "01 // ઇનપુટ",
    ingest_title: "ઇમર્જન્સી મેસેજ",
    sensors_label: "સાધનો:",
    sensor_voice: "🎙️ વૉઇસ SOS",
    sensor_cam: "📷 કેમેરા",
    sensor_gps: "📍 GPS",
    voice_wave_text: "ઑડિયો રેકોર્ડિંગ ચાલુ છે...",
    image_sub: "ચકાસણી માટે ફોટો જોડાયો",
    injected_profile_prefix: "જોડાયેલ પ્રોફાઇલ:",
    btn_orchestrate_text: "વિશ્લેષણ કરો અને મદદ મોકલો",
    output_step: "02 // આઉટપુટ",
    output_title: "માર્ગદર્શિકા",
    standby_heading: "ઇનપુટની રાહ જોઈ રહ્યું છે",
    standby_detail: "ડાબી બાજુથી કેટેગરી પસંદ કરો અને સંદેશ દાખલ કરો.",
    conflict_title: "વિરોધાભાસ મળી આવ્યો",
    ripple_title: "રિપલ ઇફેક્ટ એન્જિન",
    ripple_subtitle: "આગામી અસરોનું સ્વચાલિત અનુમાન",
    civilian_title: "તાત્કાલિક પગલાં",
    civilian_subtitle: "બચાવ માટેના ૩ સરળ ઉપાયો",
    maps_action_text: "નજીકની હોસ્પિટલનો રસ્તો (Google Maps)",
    traffic_action_text: "વૈકલ્પિક બાયપાસ રસ્તો જુઓ (Google Maps)",
    climate_action_text: "સુરક્ષિત આશ્રયસ્થાનનો રસ્તો (Google Maps)",
    custom_action_text: "જોખમ નિયંત્રણ રસ્તો જુઓ (Google Maps)",
    hospitals_title: "હોસ્પિટલ ડિરેક્ટરી",
    traffic_title: "ટ્રાફિક બાયપાસ અને વૈકલ્પિક રૂટ ડિરેક્ટરી",
    climate_title: "સ્થળાંતર કેન્દ્રો અને પૂર સેન્સર સ્થિતિ",
    custom_title: "જોખમ નિયંત્રણ ક્ષેત્ર અને સહાય",
    satellite_sync_badge: "સેટેલાઇટ સિંક",
    command_title: "કમાન્ડ સેન્ટર વ્યૂ",
    command_subtitle: "પુરાવાઓની યાદી",
    sos_pill: "🚨 તાકીદનું એલર્ટ",
    sos_heading: "સ્વચાલિત SOS સેવા",
    sos_tagline: "એક ક્લિકમાં ૧૧૨ ઇમર્જન્સી સેવાને તમારી સ્થિતિ મોકલો.",
    beacon_title: "SOS મોકલો",
    beacon_desc: "૧૧૨ કમાન્ડને લાઈવ GPS મોકલો",
    beacon_sent_strong: "SOS સંદેશ મોકલાયો:",
    direct_routing_title: "સીધો રસ્તો",
    direct_routing_desc: "GPS દ્વારા નજીકના કેન્દ્રો પર પહોંચો:",
    route_police: "🚔 નજીકનું પોલીસ સ્ટેશન",
    route_hosp: "🏥 નજીકની હોસ્પિટલ",
    speed_dial_title: "ઇમર્જન્સી નંબરો",
    dial_112_name: "સંકલિત ઇમર્જન્સી સેવા",
    dial_108_name: "એમ્બ્યુલન્સ સેવા",
    dial_100_name: "પોલીસ સેવા",
    dial_101_name: "ફાયર બ્રિગેડ",
    faq_pill: "ℹ️ મદદ",
    faq_heading: "મદદ અને સંપર્ક",
    faq_tagline: "સહાય કેવી રીતે કામ કરે છે.",
    faq_deck_title: "વારંવાર પૂછાતા પ્રશ્નો",
    faq_q1: "સહાય શું છે?",
    faq_a1: "સહાય એ ગુગલ જેમિની ૨.૫ સંચાલિત ઇમર્જન્સી ઓટોમેશન સિસ્ટમ છે.",
    faq_q_ripple: "રિપલ ઇફેક્ટ એન્જિન શું છે?",
    faq_a_ripple: "તે આકસ્મિક અવરોધોની આગળની અસરોની આગોતરી ગણતરી કરે છે.",
    faq_q2: "પ્રોફાઇલ કેવી રીતે કામ કરે છે?",
    faq_a2: "તમારું બ્લડ ગ્રૂપ અને એલર્જીની માહિતી આપમેળે ઇમર્જન્સી કોલ સાથે જોડાય છે.",
    faq_q3: "અફવાઓ કેવી રીતે ચકાસાય છે?",
    faq_a3: "તે સેન્સર ડેટા સાથે સરખામણી કરીને ખોટી અફવાઓ ઓળખે છે.",
    contact_hub_title: "મુખ્ય કાર્યાલય",
    contact_email_label_card: "ઈમેલ",
    contact_hq_label: "મુખ્ય મથક",
    contact_hq_val: "સહાય ઇમર્જન્સી AI, સેક્ટર 14",
    contact_uptime_label: "અપટાઇમ",
    contact_uptime_val: "99.998%",
    contact_enc_label: "સુરક્ષા",
    contact_enc_val: "ક્વોન્ટમ એન્ક્રિપ્શન",
    contact_form_title: "ઝડપી સંપર્ક પૂછપરછ",
    contact_btn_text: "સંદેશ મોકલો",
    contact_status_msg: "✓ સંદેશ મોકલી દેવાયો છે",
    locate_radar_btn: "📍 રડાર પર અકસ્માત જુઓ"
  }
};

// ============================================================================
// 5. LEAFLET LIVE AI RADAR INITIALIZATION
// ============================================================================
function initLeafletRadar() {
  const mapElem = document.getElementById("live-ai-radar-map");
  if (!mapElem || typeof L === "undefined") return;

  // Initialize map centered at Pune / Mumbai urban corridor
  leafletMap = L.map("live-ai-radar-map", {
    zoomControl: true,
    attributionControl: false
  }).setView([userCoords.lat, userCoords.lng], 13);

  // Set Dark Matter tiles by default
  updateMapTiles(document.documentElement.dataset.theme === "light");

  // Plot pulsing red alert incident markers
  RADAR_ALERTS.forEach(alert => {
    const icon = L.divIcon({
      className: "pulsing-alert-marker",
      html: `
        <div class="alert-radar-pulse"></div>
        <div class="alert-icon-core">🚨</div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const marker = L.marker([alert.coords.lat, alert.coords.lng], { icon })
      .addTo(leafletMap)
      .bindPopup(`
        <div class="popup-hospital-card">
          <div class="popup-hosp-title" style="color:#ff6b8b;">${alert.title}</div>
          <div class="popup-hosp-cap" style="color:#ff3366;">${alert.severity} // ${alert.type}</div>
          <div class="popup-hosp-brief">${alert.detail}</div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${alert.coords.lat},${alert.coords.lng}" target="_blank" rel="noopener noreferrer" class="popup-nav-btn" style="background:#ff3366; color:#fff;">
            AVOID & VIEW BYPASS CORRIDOR ➔
          </a>
        </div>
      `);
    marker.alertId = alert.id;
    mapMarkers.alerts.push(marker);
  });

  // Plot green medical cross hospital markers
  HOSPITALS.forEach(hosp => {
    const icon = L.divIcon({
      className: "hospital-cross-marker",
      html: `🏥`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([hosp.coords.lat, hosp.coords.lng], { icon })
      .addTo(leafletMap)
      .bindPopup(`
        <div class="popup-hospital-card">
          <img src="${hosp.image}" alt="${hosp.name}" class="popup-hosp-img" />
          <div class="popup-hosp-title">${hosp.name}</div>
          <div class="popup-hosp-cap">🟢 ${hosp.capacity}</div>
          <div class="popup-hosp-brief">${hosp.brief}</div>
          <a href="${hosp.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="popup-nav-btn">
            NAVIGATE NOW (${hosp.distance} • ${hosp.driveTime}) ➔
          </a>
        </div>
      `);

    mapMarkers.hospitals.push(marker);
  });

  // Plot User GPS Marker if available
  plotUserGpsMarker(userCoords.lat, userCoords.lng);
}

function updateMapTiles(isLight) {
  if (!leafletMap) return;

  // Remove existing tile layers
  leafletMap.eachLayer(layer => {
    if (layer instanceof L.TileLayer) {
      leafletMap.removeLayer(layer);
    }
  });

  // Use OpenStreetMap / Carto Free fallback without API key watermarks
  // OpenStreetMap with cyber-dark-tiles class gives a gorgeous, 100% watermark-free 2040 aesthetic
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const layer = L.tileLayer(tileUrl, {
    maxZoom: 19,
    subdomains: ["a", "b", "c"],
    className: isLight ? "" : "cyber-dark-tiles"
  }).addTo(leafletMap);
}

function plotUserGpsMarker(lat, lng) {
  if (!leafletMap) return;

  if (mapMarkers.user) {
    leafletMap.removeLayer(mapMarkers.user);
  }

  const userIcon = L.divIcon({
    className: "user-gps-marker",
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  mapMarkers.user = L.marker([lat, lng], { icon: userIcon })
    .addTo(leafletMap)
    .bindPopup(`
      <div style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:#67e8f9;">
        📍 <strong>YOUR TELEMETRY ANCHOR</strong><br/>
        Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°
      </div>
    `);
}

function filterMapEntities(filterType) {
  if (!leafletMap) return;

  if (filterType === "all") {
    mapMarkers.alerts.forEach(m => leafletMap.addLayer(m));
    mapMarkers.hospitals.forEach(m => leafletMap.addLayer(m));
  } else if (filterType === "alerts") {
    mapMarkers.alerts.forEach(m => leafletMap.addLayer(m));
    mapMarkers.hospitals.forEach(m => leafletMap.removeLayer(m));
  } else if (filterType === "hospitals") {
    mapMarkers.alerts.forEach(m => leafletMap.removeLayer(m));
    mapMarkers.hospitals.forEach(m => leafletMap.addLayer(m));
  }
}

// ============================================================================
// 6. GEOLOCATION & GOOGLE MAPS DEEP-LINKING
// ============================================================================
function initGeolocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        userCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        updateGoogleMapsLinks();
        if (leafletMap) {
          plotUserGpsMarker(userCoords.lat, userCoords.lng);
        }
      },
      err => {
        console.warn("[Sahaay Geolocation]: Using nominal coordinates (Sector 14 corridor).", err.message);
        updateGoogleMapsLinks();
      },
      { timeout: 7000 }
    );
  } else {
    updateGoogleMapsLinks();
  }
}

function updateGoogleMapsLinks() {
  const originStr = `${userCoords.lat},${userCoords.lng}`;
  const btnMapsAction = document.getElementById("btn-maps-action");
  const btnPolice = document.getElementById("btn-police-maps");
  const btnHosp = document.getElementById("btn-hosp-maps");

  if (btnMapsAction) {
    btnMapsAction.href = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=nearest+emergency+hospital`;
  }
  if (btnPolice) {
    btnPolice.href = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=nearest+police+station`;
  }
  if (btnHosp) {
    btnHosp.href = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=nearest+hospital`;
  }

  const geoTag = document.getElementById("geo-location-tag");
  if (geoTag) {
    geoTag.textContent = `${userCoords.lat.toFixed(4)}° N, ${userCoords.lng.toFixed(4)}° E (GPS Triangulated)`;
  }
}

// ============================================================================
// 7. CLIENT PROFILE PERSISTENCE & INJECTION
// ============================================================================
function loadClientProfile() {
  try {
    const saved = localStorage.getItem("sahaay_profile");
    if (saved) {
      clientProfile = JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to parse saved profile:", e);
  }

  // Populate form fields
  const nameInput = document.getElementById("prof-name");
  const bloodSelect = document.getElementById("prof-blood");
  const contactInput = document.getElementById("prof-contact");
  const allergiesInput = document.getElementById("prof-allergies");
  const historyInput = document.getElementById("prof-history");

  if (nameInput) nameInput.value = clientProfile.name || "";
  if (bloodSelect) bloodSelect.value = clientProfile.blood_type || "O+";
  if (contactInput) contactInput.value = clientProfile.emergency_contact || "";
  if (allergiesInput) allergiesInput.value = clientProfile.allergies || "";
  if (historyInput) historyInput.value = clientProfile.medical_history || "";

  updateInjectedProfileBadge();
}

function saveClientProfile() {
  clientProfile = {
    name: document.getElementById("prof-name").value.trim() || "User",
    blood_type: document.getElementById("prof-blood").value,
    emergency_contact: document.getElementById("prof-contact").value.trim(),
    allergies: document.getElementById("prof-allergies").value.trim(),
    medical_history: document.getElementById("prof-history").value.trim()
  };

  try {
    localStorage.setItem("sahaay_profile", JSON.stringify(clientProfile));
  } catch (e) {}

  updateInjectedProfileBadge();

  const statusPill = document.getElementById("profile-save-status");
  if (statusPill) {
    statusPill.classList.remove("hidden");
    setTimeout(() => statusPill.classList.add("hidden"), 3500);
  }
}

function updateInjectedProfileBadge() {
  const badge = document.getElementById("injected-profile-name");
  if (badge) {
    const allergySummary = clientProfile.allergies ? ` (${clientProfile.allergies.substring(0, 32)}...)` : "";
    badge.textContent = `${clientProfile.name} [${clientProfile.blood_type}]${allergySummary}`;
  }
}

// ============================================================================
// 8. SIDEBAR NAVIGATION & VIEW SWITCHING
// ============================================================================
function navigateTo(targetView) {
  // Update sidebar active tab
  document.querySelectorAll(".dock-tab").forEach(tab => {
    const isTarget = tab.dataset.view === targetView;
    tab.classList.toggle("active", isTarget);
    tab.setAttribute("aria-selected", isTarget);
  });

  // Hide all dynamic view panels
  document.querySelectorAll(".dynamic-view-panel").forEach(panel => {
    panel.classList.add("hidden");
  });

  // Handle Domain Switch vs Special Views
  if (["medical", "traffic", "climate", "others"].includes(targetView)) {
    activeDomain = targetView;
    const triageView = document.getElementById("view-triage");
    if (triageView) triageView.classList.remove("hidden");
    configureTriageDomain(targetView);
  } else {
    const targetPanel = document.getElementById(`view-${targetView}`);
    if (targetPanel) targetPanel.classList.remove("hidden");

    if (targetView === "radar" && leafletMap) {
      setTimeout(() => leafletMap.invalidateSize(), 200);
    }
  }

  activeView = targetView;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function configureTriageDomain(domainKey) {
  const cfg = DOMAINS[domainKey];
  if (!cfg) return;

  const pill = document.getElementById("hud-category-pill");
  const heading = document.getElementById("view-heading");
  const tagline = document.getElementById("view-tagline");
  const primaryLabel = document.getElementById("primary-label");
  const primaryText = document.getElementById("primary-text");
  const primaryHint = document.getElementById("primary-hint");
  const contextLabel = document.getElementById("context-label");
  const contextText = document.getElementById("context-text");
  const contextHint = document.getElementById("context-hint");
  const presetBtnLabel = document.getElementById("preset-btn-label");

  if (pill) pill.textContent = cfg.categoryPill;
  if (heading) heading.textContent = cfg.viewHeading;
  if (tagline) tagline.textContent = cfg.viewTagline;
  if (primaryLabel) primaryLabel.textContent = cfg.primaryLabel;
  if (primaryText) primaryText.placeholder = cfg.primaryPlaceholder;
  if (primaryHint) primaryHint.textContent = cfg.primaryHint;
  if (contextLabel) contextLabel.textContent = cfg.contextLabel;
  if (contextText) contextText.placeholder = cfg.contextPlaceholder;
  if (contextHint) contextHint.textContent = cfg.contextHint;
  if (presetBtnLabel) presetBtnLabel.textContent = cfg.presetLabel;

  // Clear or prepare inputs
  if (primaryText) primaryText.value = "";
  if (contextText) contextText.value = "";

  // Reset Results Zone to Standby
  const standby = document.getElementById("standby-zone");
  const results = document.getElementById("results-zone");
  if (standby) standby.classList.remove("hidden");
  if (results) results.classList.add("hidden");
}

function loadChaosScenario() {
  const cfg = DOMAINS[activeDomain];
  if (!cfg || !cfg.preset) return;

  const primaryText = document.getElementById("primary-text");
  const contextText = document.getElementById("context-text");

  if (primaryText) primaryText.value = cfg.preset.raw;
  if (contextText) contextText.value = cfg.preset.context;
}

// ============================================================================
// 9. MULTIMODAL SENSORY TOOLS (VOICE SOS, CAMERA, GPS)
// ============================================================================
function initSensoryTools() {
  const btnVoice = document.getElementById("btn-voice-sos");
  const voiceBanner = document.getElementById("voice-wave-bar");
  const primaryText = document.getElementById("primary-text");
  const camInput = document.getElementById("camera-input");
  const imgBanner = document.getElementById("image-evidence-bar");
  const imgPreview = document.getElementById("image-preview-elem");
  const imgName = document.getElementById("image-name-elem");
  const btnDiscardImg = document.getElementById("btn-discard-image");
  const btnGps = document.getElementById("btn-gps-sync");

  // Voice SOS Toggle
  if (btnVoice) {
    btnVoice.addEventListener("click", () => {
      isVoiceRecording = !isVoiceRecording;
      btnVoice.classList.toggle("recording", isVoiceRecording);

      if (isVoiceRecording) {
        if (voiceBanner) voiceBanner.classList.remove("hidden");

        // Use Web Speech API if supported, or simulate
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          try {
            speechRecognizer = new SpeechRecognition();
            speechRecognizer.continuous = true;
            speechRecognizer.interimResults = true;
            speechRecognizer.onresult = event => {
              let transcript = "";
              for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
              }
              if (primaryText) primaryText.value = transcript;
            };
            speechRecognizer.start();
          } catch (e) {
            simulateVoiceInput();
          }
        } else {
          simulateVoiceInput();
        }
      } else {
        if (voiceBanner) voiceBanner.classList.add("hidden");
        if (speechRecognizer) {
          try { speechRecognizer.stop(); } catch (e) {}
        }
      }
    });
  }

  function simulateVoiceInput() {
    setTimeout(() => {
      if (!isVoiceRecording) return;
      const sampleDistress = `[VOICE AUDIO STREAM RECORDED]: "Emergency! We are trapped near the bypass bridge! Water is rising rapidly and my mother cannot walk! Please send an evacuation team immediately!"`;
      if (primaryText) primaryText.value = sampleDistress;
      if (voiceBanner) voiceBanner.classList.add("hidden");
      if (btnVoice) btnVoice.classList.remove("recording");
      isVoiceRecording = false;
    }, 3800);
  }

  // Camera Capture Preview
  if (camInput) {
    camInput.addEventListener("change", e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => {
          if (imgPreview) imgPreview.src = ev.target.result;
          if (imgName) imgName.textContent = file.name;
          if (imgBanner) imgBanner.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (btnDiscardImg) {
    btnDiscardImg.addEventListener("click", () => {
      if (camInput) camInput.value = "";
      if (imgBanner) imgBanner.classList.add("hidden");
      if (imgPreview) imgPreview.src = "";
    });
  }

  // GPS Sync Button
  if (btnGps) {
    btnGps.addEventListener("click", () => {
      initGeolocation();
      const contextText = document.getElementById("context-text");
      if (contextText) {
        contextText.value += `\n[SATELLITE GPS LOCK]: Lat ${userCoords.lat.toFixed(4)}°, Lng ${userCoords.lng.toFixed(4)}° (Altitude: 560m, Accuracy: 3.2m)`;
      }
    });
  }
}

// ============================================================================
// 10. TRIAGE SYNTHESIS ENGINE (WITH PREDICTIVE RIPPLE EFFECT)
// ============================================================================
async function executeTriageSynthesis() {
  const primaryText = document.getElementById("primary-text");
  const contextText = document.getElementById("context-text");
  const btnSubmit = document.getElementById("btn-orchestrate");
  const btnText = document.getElementById("btn-orchestrate-text");

  const raw = primaryText ? primaryText.value.trim() : "";
  const context = contextText ? contextText.value.trim() : "";

  if (!raw) {
    alert("Please provide panicked audio transcript, symptoms, or click 'Load Chaos Scenario'.");
    return;
  }

  if (btnSubmit) btnSubmit.disabled = true;
  if (btnText) btnText.textContent = "SYNTHESIZING RIPPLE EFFECT & ACTIONS...";

  const payload = {
    category: activeDomain,
    raw_text: raw,
    context_data: context,
    client_profile: clientProfile
  };

  try {
    const res = await fetch("http://localhost:8000/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderTriageResults(data);
  } catch (err) {
    console.warn("[Sahaay Bridge]: Backend offline or unreachable -> Executing deterministic fail-closed client engine.", err);
    const mockData = generateClientFallback(activeDomain, raw, context);
    renderTriageResults(mockData);
  } finally {
    if (btnSubmit) btnSubmit.disabled = false;
    if (btnText) btnText.textContent = "SYNTHESIZE & DISPATCH ACTIONS";
  }
}

// Function to directly zoom and open popup for an incident on the Live Radar
function locateIncidentOnRadar(alertId) {
  navigateTo("radar");
  if (!leafletMap) return;

  const alertData = RADAR_ALERTS.find(a => a.id === alertId) || RADAR_ALERTS[0];
  if (alertData) {
    leafletMap.setView([alertData.coords.lat, alertData.coords.lng], 15, { animate: true });
    const targetMarker = mapMarkers.alerts.find(m => m.alertId === alertData.id);
    if (targetMarker) {
      setTimeout(() => targetMarker.openPopup(), 350);
    }
  }
}

function renderTriageResults(data) {
  const standby = document.getElementById("standby-zone");
  const results = document.getElementById("results-zone");

  if (standby) standby.classList.add("hidden");
  if (results) results.classList.remove("hidden");

  // Determine current active category from data or activeDomain
  const category = (data.category || activeDomain || "medical").toLowerCase();

  // 1. Conflict & Allergy Banner
  const conflictCard = document.getElementById("conflict-card");
  const conflictDesc = document.getElementById("conflict-desc");
  if (conflictCard) {
    if (data.conflict_detected) {
      conflictCard.classList.remove("hidden");
      if (conflictDesc) conflictDesc.textContent = data.conflict_details;
    } else {
      conflictCard.classList.add("hidden");
    }
  }

  // 2. PREDICTIVE RIPPLE EFFECT ENGINE DISPLAY
  const secondOrderElem = document.getElementById("ripple-second-order-text");
  const thirdOrderElem = document.getElementById("ripple-third-order-text");
  const mitigationElem = document.getElementById("ripple-mitigation-text");
  const riskBadge = document.getElementById("ripple-risk-badge");

  const ripple = data.ripple_effect_prediction || {
    second_order_effect: "Ambulance routes to City Hospital delayed by 40 minutes due to Highway 9 gridlock.",
    third_order_effect: "Trauma ICU bed saturation forces diversion of acute cases to regional clinics.",
    automated_mitigation: "AI has automatically notified City Hospital to route trauma patients to Westside Clinic and cleared Route 4B.",
    cascading_risk_level: "CRITICAL"
  };

  if (secondOrderElem) secondOrderElem.textContent = ripple.second_order_effect;
  if (thirdOrderElem) thirdOrderElem.textContent = ripple.third_order_effect;
  if (mitigationElem) mitigationElem.textContent = ripple.automated_mitigation;
  if (riskBadge) {
    riskBadge.textContent = `CASCADING RISK: ${ripple.cascading_risk_level}`;
  }

  // 3. Civilian View (3 Jargon-Free Survival Directives)
  const civilianList = document.getElementById("civilian-steps");
  if (civilianList) {
    civilianList.innerHTML = "";
    const steps = data.civilian_instructions || [
      "Follow emergency safety instructions immediately.",
      "Stay in a secure location and avoid hazardous areas.",
      "Follow verified official municipal updates."
    ];
    steps.slice(0, 3).forEach(step => {
      const li = document.createElement("li");
      li.textContent = step;
      civilianList.appendChild(li);
    });
  }

  // 4. Domain-Aware Action Button & Google Maps Deep-Link
  const btnMapsAction = document.getElementById("btn-maps-action");
  const mapsActionText = document.getElementById("maps-action-text");
  const originStr = `${userCoords.lat},${userCoords.lng}`;

  const currentLang = localStorage.getItem("sahaay_lang") || "en";
  const tr = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  if (category === "traffic") {
    if (btnMapsAction) btnMapsAction.href = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=18.5204,73.8567`;
    if (mapsActionText) mapsActionText.textContent = tr.traffic_action_text || "VIEW ALTERNATE BYPASS ROUTE (GOOGLE MAPS)";
  } else if (category === "climate") {
    if (btnMapsAction) btnMapsAction.href = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=High+Ridge+Gymnasium+Pune`;
    if (mapsActionText) mapsActionText.textContent = tr.climate_action_text || "NAVIGATE TO HIGH RIDGE EVACUATION SHELTER (GOOGLE MAPS)";
  } else if (category === "others") {
    if (btnMapsAction) btnMapsAction.href = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=18.4980,73.8650`;
    if (mapsActionText) mapsActionText.textContent = tr.custom_action_text || "VIEW HAZARD CONTAINMENT CORRIDOR (GOOGLE MAPS)";
  } else {
    if (btnMapsAction) btnMapsAction.href = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=nearest+emergency+hospital`;
    if (mapsActionText) mapsActionText.textContent = tr.maps_action_text || "NAVIGATE TO NEAREST EMERGENCY HOSPITAL (GOOGLE MAPS)";
  }

  // 5. Domain-Aware Secondary Section (Hospitals vs Traffic Bypass vs Evacuation)
  renderDomainAssetDeck(category, data, tr);

  // 6. Command Dispatch View (Table with auditable evidence ledger)
  const priorityPill = document.getElementById("priority-pill");
  if (priorityPill) {
    priorityPill.textContent = (data.triage_priority || "P1_CRITICAL").replace("_", " ");
  }

  const tableZone = document.getElementById("command-table-zone");
  if (tableZone) {
    let rowsHtml = "";

    if (data.suspected_condition) {
      rowsHtml += `<tr><th>Condition / State</th><td><strong>${data.suspected_condition}</strong></td></tr>`;
    }
    if (data.hazard_classification) {
      rowsHtml += `<tr><th>Hazard Classification</th><td>${data.hazard_classification}</td></tr>`;
    }
    if (data.estimated_geo_anchor) {
      rowsHtml += `<tr><th>Standardized Geo-Anchor</th><td>${data.estimated_geo_anchor}</td></tr>`;
    }
    if (data.blockage_severity) {
      rowsHtml += `<tr><th>Blockage Severity</th><td><span class="badge-pulsing-red">${data.blockage_severity}</span></td></tr>`;
    }
    if (data.hazard_type) {
      rowsHtml += `<tr><th>Hazard Type</th><td>${data.hazard_type}</td></tr>`;
    }
    if (data.threat_level) {
      rowsHtml += `<tr><th>Threat Level</th><td><span class="badge-pulsing-red">${data.threat_level}</span></td></tr>`;
    }
    if (data.extracted_vitals && data.extracted_vitals.length) {
      rowsHtml += `<tr><th>Extracted Vitals</th><td>${data.extracted_vitals.join(" • ")}</td></tr>`;
    }
    if (data.required_antidotes && data.required_antidotes.length) {
      rowsHtml += `<tr><th>Required Interventions</th><td>${data.required_antidotes.join(" • ")}</td></tr>`;
    }
    if (data.alternate_routing_suggestions && data.alternate_routing_suggestions.length) {
      rowsHtml += `<tr><th>Alternate Bypass Corridors</th><td>${data.alternate_routing_suggestions.join("<br/>")}</td></tr>`;
    }
    if (data.evacuation_directives) {
      rowsHtml += `<tr><th>Evacuation Directives</th><td>${data.evacuation_directives}</td></tr>`;
    }
    if (data.recommended_action && data.recommended_action.length) {
      rowsHtml += `<tr><th>Recommended Actions</th><td>${data.recommended_action.join("<br/>")}</td></tr>`;
    }

    // Evidence Ledger
    if (data.evidence_ledger && data.evidence_ledger.length) {
      const evidenceRows = data.evidence_ledger.map(
        e => `<div style="margin-bottom:4px;">• <strong>[${e.source}]:</strong> ${e.claim} <em>(${e.confidence})</em></div>`
      ).join("");
      rowsHtml += `<tr><th>Auditable Evidence</th><td>${evidenceRows}</td></tr>`;
    }

    tableZone.innerHTML = `<table class="cyber-table"><tbody>${rowsHtml}</tbody></table>`;
  }
}

function renderDomainAssetDeck(category, data, tr) {
  const titleElem = document.getElementById("hospitals-title");
  const deck = document.getElementById("hospitals-deck");
  const geoTag = document.getElementById("geo-location-tag");

  if (!deck) return;

  if (category === "traffic") {
    if (titleElem) titleElem.textContent = tr.traffic_title || "Triangulated Corridors & Alternate Bypass Routing";
    if (geoTag) geoTag.textContent = data.estimated_geo_anchor || "18.5204° N, 73.8567° E (Sector 14 Overpass)";

    const bypassRoutes = (data.alternate_routing_suggestions && data.alternate_routing_suggestions.length)
      ? data.alternate_routing_suggestions
      : [
          "Civilian Traffic: Divert via Northern Ring Arterial (Bypass Route 4B)",
          "Emergency Vehicles: Counterflow transit lane opened with priority green-wave"
        ];

    deck.innerHTML = `
      <div class="corridor-card" style="grid-column: 1 / -1;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <span class="corridor-badge badge-critical">🚨 LIVE RED ALERT ON MAP</span>
            <div class="corridor-title" style="margin-top:4px;">Highway 9 Overpass Multi-Car Pileup & 11kV Cable</div>
            <div class="corridor-desc">Sector 14 Flyover Toll Plaza • Blockage: ${data.blockage_severity || "HIGH"}</div>
          </div>
          <button type="button" class="btn-locate-radar" onclick="locateIncidentOnRadar('alert-1')">
            ${tr.locate_radar_btn || "📍 LOCATE INCIDENT ON AI RADAR"}
          </button>
        </div>
      </div>
      ${bypassRoutes.map((route, i) => `
        <div class="corridor-card">
          <span class="corridor-badge badge-safe">ROUTE OPTION ${i + 1}</span>
          <div class="corridor-title">${route.split(":")[0] || "Alternate Corridor"}</div>
          <div class="corridor-desc">${route.split(":")[1] || route}</div>
        </div>
      `).join("")}
    `;
  } else if (category === "climate") {
    if (titleElem) titleElem.textContent = tr.climate_title || "Evacuation Assembly Points & Hydro-Sensor Status";
    if (geoTag) geoTag.textContent = "Sector 14 Riverbank & Low Causeway";

    deck.innerHTML = `
      <div class="corridor-card" style="grid-column: 1 / -1;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <span class="corridor-badge badge-critical">🚨 FLASH FLOOD SURGE ALERT</span>
            <div class="corridor-title" style="margin-top:4px;">Low Causeway Storm Inundation (1.8m Depth)</div>
            <div class="corridor-desc">${data.evacuation_directives || "Zone 4 Residents: Evacuate vertically to High Ridge Gymnasium."}</div>
          </div>
          <button type="button" class="btn-locate-radar" onclick="locateIncidentOnRadar('alert-2')">
            ${tr.locate_radar_btn || "📍 LOCATE INCIDENT ON AI RADAR"}
          </button>
        </div>
      </div>
      <div class="corridor-card">
        <span class="corridor-badge badge-safe">PRIMARY ASSEMBLY POINT</span>
        <div class="corridor-title">High Ridge Community Gymnasium</div>
        <div class="corridor-desc">Capacity: 450 civilians • Power: Generator active • First Aid: On-site</div>
      </div>
      <div class="corridor-card">
        <span class="corridor-badge">HYDRO SCADA SENSOR S-12</span>
        <div class="corridor-title">Radial Dam Gate Telemetry</div>
        <div class="corridor-desc">Status: 100% Closed (0 Discharge) • River velocity: 3.2 m/s</div>
      </div>
    `;
  } else if (category === "others") {
    if (titleElem) titleElem.textContent = tr.custom_title || "Hazard Containment Zone & Critical Response";
    if (geoTag) geoTag.textContent = "18.4980° N, 73.8650° E (Rail Siding 4)";

    deck.innerHTML = `
      <div class="corridor-card" style="grid-column: 1 / -1;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <span class="corridor-badge badge-critical">🚨 TOXIC VAPOR PLUME CONTAINMENT</span>
            <div class="corridor-title" style="margin-top:4px;">Chlorine/Ammonia Pressurized Tanker Leak</div>
            <div class="corridor-desc">Perimeter: 500m Downwind • Wind: SSW 14 knots</div>
          </div>
          <button type="button" class="btn-locate-radar" onclick="locateIncidentOnRadar('alert-3')">
            ${tr.locate_radar_btn || "📍 LOCATE INCIDENT ON AI RADAR"}
          </button>
        </div>
      </div>
    `;
  } else {
    // Medical category: default to hospital directory
    if (titleElem) titleElem.textContent = tr.hospitals_title || "Triangulated Coordinates & Hospital Directory";
    if (geoTag) geoTag.textContent = `${userCoords.lat.toFixed(4)}° N, ${userCoords.lng.toFixed(4)}° E (GPS Triangulated)`;
    renderHospitalsDeck();
  }
}

function renderHospitalsDeck() {
  const deck = document.getElementById("hospitals-deck");
  if (!deck) return;

  deck.innerHTML = HOSPITALS.map(h => `
    <div class="hospital-mini-card">
      <img src="${h.image}" alt="${h.name}" class="mini-img" />
      <div class="mini-details">
        <div class="mini-name">${h.name}</div>
        <div class="mini-cap">🟢 ${h.capacity}</div>
        <div class="mini-dist">${h.distance} • ${h.driveTime} drive</div>
      </div>
    </div>
  `).join("");
}

// Client Fallback Generator with Ripple Effects
function generateClientFallback(category, raw, context) {
  const rLower = (raw || "").toLowerCase();
  const cLower = (context || "").toLowerCase();
  const profileAllergies = (clientProfile.allergies || "").toLowerCase();

  if (category === "medical") {
    const hasAllergy = profileAllergies.includes("penicillin") || cLower.includes("penicillin");
    return {
      category: "medical",
      triage_priority: "P1_CRITICAL",
      suspected_condition: "Acute Cardiogenic Shock & Anaphylaxis Vulnerability",
      extracted_vitals: [
        "Heart Rate: 134 bpm (Tachycardia)",
        "Blood Pressure: 82/50 mmHg (Hypotension)",
        "SpO2: 86% (Critical Hypoxia)"
      ],
      required_antidotes: [
        "Sublingual Nitroglycerin / IV Calcium Gluconate",
        "Non-Beta-Lactam Protocol (Azithromycin standby)",
        "High-Flow Supplemental Oxygen (15 L/min)"
      ],
      civilian_instructions: [
        "Position patient elevated upright at a 45-degree angle; do NOT lay patient flat.",
        "Loosen tight collar and ensure unobstructed airflow.",
        "Keep all medication boxes ready at the front threshold for incoming paramedics."
      ],
      conflict_detected: hasAllergy,
      conflict_details: "CRITICAL DRUG ALLERGY FLAGGED VIA PROFILE INJECTION: Patient has recorded severe anaphylactic shock to Penicillin/Amoxicillin. Beta-lactam antibiotics must be withheld.",
      evidence_ledger: [
        { source: "Caller Voice Audio Stream", claim: "Chest pain, cold diaphoresis, gasping for breath", confidence: "HIGH" },
        { source: "Home Telemetry Monitor", claim: "HR 134 bpm, BP 82/50, SpO2 86%", confidence: "HIGH" },
        { source: "Injected Client Profile", claim: `Patient: ${clientProfile.name}, Blood: ${clientProfile.blood_type}, Allergy: Penicillin`, confidence: "HIGH" }
      ],
      ripple_effect_prediction: {
        second_order_effect: "Sacred Heart Hospital Trauma ICU is at 82% capacity; cardiac intake will push trauma unit beyond safety margins in 30 minutes.",
        third_order_effect: "Regional ambulance diversion will delay peripheral medical calls in Sector 14 by 22%.",
        automated_mitigation: "AI pre-booked ICU Bed #4 at Sacred Heart and alerted Ruby Hall emergency team to accept peripheral diversions.",
        cascading_risk_level: "CRITICAL"
      }
    };
  } else if (category === "traffic") {
    return {
      category: "traffic",
      triage_priority: "P2_URGENT",
      estimated_geo_anchor: "18.5204° N, 73.8567° E (Sector 14 Corridor)",
      blockage_severity: "HIGH",
      hazard_classification: "Downed High-Tension Transmission Cables & Submerged Roadway",
      alternate_routing_suggestions: [
        "Civilian Traffic: Divert via Northern Ring Arterial (Bypass Route 4B)",
        "Emergency Vehicles: Counterflow transit lane opened with priority green-wave"
      ],
      civilian_instructions: [
        "Halt vehicles at least 50 meters back from flooded roadway with downed wires.",
        "Remain inside vehicle chassis if live wire touches metal frame; do NOT step out.",
        "Follow traffic warden signals toward Exit 12 detour."
      ],
      conflict_detected: false,
      conflict_details: "",
      evidence_ledger: [
        { source: "Motorist Voice Transmission", claim: "High-tension electrical cable snapped across roadway; sparks in floodwater", confidence: "HIGH" },
        { source: "Smart Grid Feeder #9", claim: "Earth-fault trip registered in Sector 14", confidence: "HIGH" }
      ],
      ripple_effect_prediction: {
        second_order_effect: "Ambulance routes to City Hospital delayed by 40 minutes due to Highway 9 gridlock.",
        third_order_effect: "Industrial logistics feeder stalled, backing up 14 bulk hazardous chemical carriers.",
        automated_mitigation: "AI has automatically notified City Hospital to route trauma patients to Westside Clinic instead and cleared Route 4B.",
        cascading_risk_level: "HIGH"
      }
    };
  } else if (category === "others") {
    return {
      category: "others",
      triage_priority: "P2_URGENT",
      ai_categorization: "Industrial Pressurized Chemical Vapor Hazard",
      risk_assessment: "Toxic inhalation hazard within 300m radius; vapor cloud drifting south-southwest.",
      recommended_action: [
        "Dispatch HazMat Level-A team with chemical neutralizing vapor spray.",
        "Evacuate residential blocks within 500m downwind along Rail Siding 4.",
        "Issue cell-broadcast warning to seal windows."
      ],
      civilian_instructions: [
        "Move immediately perpendicular (crosswind) to vapor drift; do NOT run downwind.",
        "Cover nose and mouth with a damp cloth or N95 mask.",
        "Seal doors and windows with damp towels if trapped indoors."
      ],
      conflict_detected: false,
      conflict_details: "",
      evidence_ledger: [
        { source: "Community Warden Alert", claim: "Pressurized tank car hissing yellow-green vapor, burning eyes, coughing", confidence: "HIGH" }
      ],
      ripple_effect_prediction: {
        second_order_effect: "Vapor plume threatens municipal railway corridor; incoming express train #12104 faces toxic cloud in 12 mins.",
        third_order_effect: "Emergency rooms in South Zone will receive a surge of 60+ respiratory patients within 45 minutes.",
        automated_mitigation: "AI autonomously triggered rail signaling halt at Signal Box 9 and pre-dispatched 80 oxygen cylinders to Westside Clinic.",
        cascading_risk_level: "CRITICAL"
      }
    };
  } else {
    const isConflict = rLower.includes("dam") && (rLower.includes("broke") || rLower.includes("burst"));
    return {
      category: "climate",
      triage_priority: isConflict ? "P2_URGENT" : "P1_CRITICAL",
      threat_level: "HIGH",
      hazard_type: isConflict ? "Flash Flood Inundation & Informational Discrepancy" : "Catastrophic Flash Flood Surge",
      evacuation_directives: "Zone 4 Residents: Evacuate vertically to 2nd floor or reinforced rooftops. Assembly: High Ridge Gymnasium.",
      civilian_instructions: [
        "Do NOT enter walking or driving floodwaters; currents above 15cm can sweep individuals away.",
        "Shut off domestic electrical MCB mains before flood reaches lower wall sockets.",
        "Tune to civil emergency broadcast 104.4 MHz for verified official updates."
      ],
      conflict_detected: isConflict,
      conflict_details: isConflict ? "DISCREPANCY ALERT: Social distress feeds claim main reservoir dam breached. Authoritative SCADA telemetry confirms radial gates are 100% closed (0 discharge) and river level remains within primary levee banks." : "",
      evidence_ledger: [
        { source: "Civilian Distress Audio", claim: "Claims Khopoli dam broke and bridge washed away", confidence: "LOW" },
        { source: "Irrigation SCADA Telemetry", claim: "Dam radial gates 100% closed, spillway discharge 0 cumecs", confidence: "HIGH" }
      ],
      ripple_effect_prediction: {
        second_order_effect: "Mass panic fleeing non-existent dam failure will cause human stampede onto Low Causeway, which IS flooded by storm runoff.",
        third_order_effect: "Mobile cell towers in Zone 4 will experience 400% bandwidth overload, blinding 911 lines.",
        automated_mitigation: "AI issued emergency SMS debunk broadcast to 45,000 localized cell phones confirming dam integrity and dispatched police to seal Low Causeway.",
        cascading_risk_level: "HIGH"
      }
    };
  }
}

// ============================================================================
// 11. AUTOMATED SOS DISPATCH SIMULATION
// ============================================================================
function initAutomatedSos() {
  const btnSos = document.getElementById("btn-fire-sos");
  const confirmBox = document.getElementById("sos-dispatch-confirmation");
  const terminalWindow = document.getElementById("sos-terminal-log");
  const terminalText = document.getElementById("sos-terminal-text");

  if (!btnSos) return;

  btnSos.addEventListener("click", () => {
    btnSos.disabled = true;
    if (confirmBox) confirmBox.classList.add("hidden");
    if (terminalWindow) terminalWindow.classList.remove("hidden");
    if (terminalText) terminalText.textContent = "";

    const steps = [
      `[00:00.02] INITIATING QUANTUM SOS OVERRIDE BEACON...`,
      `[00:00.35] ACQUIRING SATELLITE GPS FIX: ${userCoords.lat.toFixed(4)}° N, ${userCoords.lng.toFixed(4)}° E`,
      `[00:00.78] INJECTING PROFILE: ${clientProfile.name} | BLOOD: ${clientProfile.blood_type}`,
      `[00:01.12] INJECTING ALLERGY INTERLOCK: ${clientProfile.allergies}`,
      `[00:01.54] ROUTING TELEMETRY VIA ENCRYPTED MESH TO NATIONAL COMMAND 112...`,
      `[00:02.10] 112 CAD HANDSHAKE: ACKNOWLEDGED (INCIDENT TICKET #IND-2040-9941)`,
      `[00:02.65] DISPATCHING: ALS Ambulance Unit #4 (ETA 4 mins) & Highway Patrol Unit #12`,
      `[00:03.10] DISPATCH COMPLETE. AUDIO & GPS MONITORING CONTINUES LIVE.`
    ];

    let delay = 0;
    steps.forEach((line, index) => {
      setTimeout(() => {
        if (terminalText) {
          terminalText.textContent += line + "\n";
          terminalText.scrollTop = terminalText.scrollHeight;
        }
        if (index === steps.length - 1) {
          btnSos.disabled = false;
          if (confirmBox) {
            confirmBox.classList.remove("hidden");
            const confirmDetail = document.getElementById("sos-confirm-detail");
            if (confirmDetail) {
              confirmDetail.textContent = `Ticket #IND-2040-9941. ALS Paramedics & Patrol en route to ${userCoords.lat.toFixed(4)}° N, ${userCoords.lng.toFixed(4)}° E.`;
            }
          }
        }
      }, delay);
      delay += 450;
    });
  });
}

// ============================================================================
// 12. THEME & MULTILINGUAL SWITCHERS
// ============================================================================
function initThemeSwitch() {
  const btnToggle = document.getElementById("btn-theme-toggle");
  const labelText = document.getElementById("theme-label-text");

  const savedTheme = localStorage.getItem("sahaay_theme") || "dark";
  applyTheme(savedTheme === "dark");

  if (btnToggle) {
    btnToggle.addEventListener("click", () => {
      const isCurrentlyDark = document.documentElement.dataset.theme !== "light";
      const newIsDark = !isCurrentlyDark;
      applyTheme(newIsDark);
    });
  }

  function applyTheme(isDark) {
    const themeName = isDark ? "dark" : "light";
    document.documentElement.dataset.theme = themeName;
    try { localStorage.setItem("sahaay_theme", themeName); } catch (e) {}

    if (labelText) {
      labelText.textContent = isDark ? "Theme: Dark Cyber" : "Theme: Light Holo";
    }

    if (leafletMap) {
      updateMapTiles(!isDark);
    }
  }
}

function initLanguageSwitch() {
  const langSelect = document.getElementById("lang-select");
  if (!langSelect) return;

  const savedLang = localStorage.getItem("sahaay_lang") || "en";
  langSelect.value = savedLang;
  applyLanguage(savedLang);

  langSelect.addEventListener("change", e => {
    applyLanguage(e.target.value);
  });
}

function applyLanguage(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  try { localStorage.setItem("sahaay_lang", lang); } catch (e) {}

  // 1. Update text content for all elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach(elem => {
    const key = elem.getAttribute("data-i18n");
    if (dict[key]) {
      elem.textContent = dict[key];
    }
  });

  // 2. Update placeholders for inputs and textareas
  const primaryText = document.getElementById("primary-text");
  const contextText = document.getElementById("context-text");
  if (DOMAINS[activeDomain]) {
    const cfg = DOMAINS[activeDomain];
    if (primaryText && !primaryText.value) primaryText.placeholder = cfg.primaryPlaceholder;
    if (contextText && !contextText.value) contextText.placeholder = cfg.contextPlaceholder;
  }

  // 3. Update active domain HUD if currently on triage
  if (activeView === "medical" || activeView === "traffic" || activeView === "climate" || activeView === "others") {
    configureTriageDomain(activeDomain);
  }
}

// ============================================================================
// 13. DOM INITIALIZATION
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Theme & Language
  initThemeSwitch();
  initLanguageSwitch();

  // 2. Load Client Profile
  loadClientProfile();
  const btnSaveProfile = document.getElementById("btn-save-profile");
  if (btnSaveProfile) {
    btnSaveProfile.addEventListener("click", saveClientProfile);
  }

  // 3. Geolocation & Map Deep-Linking
  initGeolocation();

  // 4. Leaflet Live AI Radar
  initLeafletRadar();

  // Radar Map Recenter Button
  const btnRecenter = document.getElementById("btn-radar-recenter");
  if (btnRecenter) {
    btnRecenter.addEventListener("click", () => {
      if (leafletMap && userCoords) {
        leafletMap.setView([userCoords.lat, userCoords.lng], 14, { animate: true });
        plotUserGpsMarker(userCoords.lat, userCoords.lng);
      }
    });
  }

  // Radar Filter Buttons
  document.querySelectorAll(".btn-map-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-map-filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filterMapEntities(btn.dataset.filter);
    });
  });

  // 5. Sidebar Navigation Listeners
  document.querySelectorAll(".dock-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      navigateTo(tab.dataset.view);
    });
  });

  // 6. Preset Scenario Loader
  const btnLoadPreset = document.getElementById("btn-load-preset");
  if (btnLoadPreset) {
    btnLoadPreset.addEventListener("click", loadChaosScenario);
  }

  // 7. Sensory Tools (Voice SOS, Camera, GPS)
  initSensoryTools();

  // 8. Triage Form Submission
  const formTriage = document.getElementById("triage-form");
  if (formTriage) {
    formTriage.addEventListener("submit", e => {
      e.preventDefault();
      executeTriageSynthesis();
    });
  }

  // 9. Automated SOS Dispatch
  initAutomatedSos();

  // 10. Contact Us Form Simulation
  const btnSendContact = document.getElementById("btn-send-contact");
  if (btnSendContact) {
    btnSendContact.addEventListener("click", () => {
      const status = document.getElementById("contact-status-msg");
      if (status) {
        status.classList.remove("hidden");
        setTimeout(() => status.classList.add("hidden"), 4000);
      }
    });
  }

  // Default to Live AI Radar view
  navigateTo("radar");
});
