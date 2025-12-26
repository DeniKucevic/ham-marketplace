// Popular HAM equipment organized by category

export const POPULAR_MANUFACTURERS = [
  "Yaesu",
  "Icom",
  "Kenwood",
  "Elecraft",
  "Xiegu",
  "FlexRadio",
  "Heathkit",
  "Alinco",
  "Anytone",
  "Baofeng",
  "MFJ",
  "Cushcraft",
  "Diamond",
  "Comet",
  "Hustler",
  "Heil",
  "Ameritron",
  "Alpha",
  "Ten-Tec",
  "Quansheng",
];

export const POPULAR_HF_TRANSCEIVERS = [
  // Yaesu
  "FT-991A",
  "FT-710",
  "FT-dx10",
  "FT-857D",
  "FT-891",
  "FT-450D",
  "FT-818",
  "FT-dx101D",
  "FT-dx101MP",
  "FT-1000MP",
  "FT-920",
  "FT-897D",

  // Icom
  "IC-7300",
  "IC-705",
  "IC-7610",
  "IC-746PRO",
  "IC-718",
  "IC-7851",
  "IC-7600",
  "IC-756PROIII",
  "IC-9700",
  "IC-7410",

  // Kenwood
  "TS-590SG",
  "TS-890S",
  "TS-480SAT",
  "TS-2000",
  "TS-990S",
  "TS-570D",
  "TS-450S",

  // Elecraft
  "K3",
  "KX3",
  "K4",
  "KX2",
  "K2",

  // Xiegu
  "G90",
  "X6100",
  "G106",
  "X5105",

  // FlexRadio
  "6400",
  "6600",
  "6700",

  // Ten-Tec
  "Omni VII",
  "Orion",
  "Argonaut V",
];

export const POPULAR_VHF_UHF_TRANSCEIVERS = [
  // Yaesu
  "FT-8800R",
  "FT-8900R",
  "FT-7900R",
  "FTM-400XDR",
  "FTM-300DR",

  // Icom
  "IC-2730A",
  "IC-7100",
  "ID-5100A",
  "IC-V86",

  // Kenwood
  "TM-D710G",
  "TM-V71A",
  "TM-281A",
];

export const POPULAR_HANDHELD_TRANSCEIVERS = [
  // Yaesu
  "FT-70DR",
  "FT-65R",
  "VX-6R",
  "FT-4XR",

  // Icom
  "ID-52A",
  "ID-51A",
  "IC-V80",

  // Kenwood
  "TH-D74A",
  "TH-D72A",
  "TH-K20A",

  // Baofeng
  "UV-5R",
  "UV-82",
  "BF-F8HP",

  // Anytone
  "AT-D878UV",
  "AT-D868UV",

  //Quansheng
  "UV-K5",
];

export const POPULAR_ANTENNAS = [
  // Models only
  "6BTV",
  "R7000",
  "R8",
  "A3S",
  "A4S",
  "X50",
  "X200",
  "GP-3",
  "GP-9",
  "1984",
  "G5RV",
  "OCF Dipole",
];

export const POPULAR_AMPLIFIERS = [
  "AL-811",
  "AL-1200",
  "AL-80B",
  "87A",
  "8410",
  "HL-1.2KFX",
  "Expert 1.3K-FA",
  "1000",
  "2000A",
];

export const POPULAR_TUNERS = [
  "949E",
  "993B",
  "998",
  "AT-200Pro",
  "AT-Auto",
  "KAT500",
];

// Combine all models for autocomplete
export const ALL_MODELS = [
  ...POPULAR_HF_TRANSCEIVERS,
  ...POPULAR_VHF_UHF_TRANSCEIVERS,
  ...POPULAR_HANDHELD_TRANSCEIVERS,
  ...POPULAR_ANTENNAS,
  ...POPULAR_AMPLIFIERS,
  ...POPULAR_TUNERS,
].sort();

// Helper function to filter models by category
export function getModelsByCategory(category: string): string[] {
  switch (category) {
    case "transceiver_hf":
      return POPULAR_HF_TRANSCEIVERS;
    case "transceiver_vhf_uhf":
      return POPULAR_VHF_UHF_TRANSCEIVERS;
    case "transceiver_handheld":
      return POPULAR_HANDHELD_TRANSCEIVERS;
    case "antenna_hf":
    case "antenna_vhf_uhf":
    case "antenna_accessories":
      return POPULAR_ANTENNAS;
    case "amplifier":
      return POPULAR_AMPLIFIERS;
    case "tuner":
      return POPULAR_TUNERS;
    default:
      return ALL_MODELS;
  }
}
