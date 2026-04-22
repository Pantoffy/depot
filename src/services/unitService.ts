import axios from "axios";

// Interface matching Unit model
export interface Unit {
  id: number;
  name: string;
  description?: string;
}

export type UnitType = "weight" | "volume" | "length" | "count" | "package";

export interface UnitSuggestion {
  unitId: number;
  unitName: string;
  unitType: UnitType;
  allowDecimal: boolean;
  confidence: "high" | "medium" | "fallback";
}

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: "/api/Unit",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

type UnitDefinition = {
  id: number;
  name: string;
  type: UnitType;
  allowDecimal: boolean;
  aliases?: string[];
};

type UnitKeywordRule = {
  unitName: string;
  keywords: string[];
  excludeKeywords?: string[];
  priority?: number;
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const matchWholePhrase = (text: string, keyword: string) => {
  const pattern = new RegExp(`(^|\\s)${escapeRegex(keyword)}($|\\s)`);
  return pattern.test(text);
};

const UNIT_DEFINITIONS: UnitDefinition[] = [
  { id: 1, name: "kg", type: "weight", allowDecimal: true },
  { id: 2, name: "g", type: "weight", allowDecimal: true },
  { id: 3, name: "lít", type: "volume", allowDecimal: true, aliases: ["lit"] },
  { id: 4, name: "ml", type: "volume", allowDecimal: true },
  { id: 5, name: "mét", type: "length", allowDecimal: true, aliases: ["met"] },
  { id: 6, name: "cm", type: "length", allowDecimal: true },
  { id: 7, name: "cái", type: "count", allowDecimal: false, aliases: ["cai"] },
  { id: 8, name: "chiếc", type: "count", allowDecimal: false, aliases: ["chiec"] },
  { id: 9, name: "bộ", type: "count", allowDecimal: false, aliases: ["bo"] },
  { id: 10, name: "con", type: "count", allowDecimal: false },
  { id: 11, name: "quả", type: "count", allowDecimal: false, aliases: ["qua"] },
  { id: 12, name: "hộp", type: "package", allowDecimal: false, aliases: ["hop"] },
  { id: 13, name: "gói", type: "package", allowDecimal: false, aliases: ["goi"] },
  { id: 14, name: "túi", type: "package", allowDecimal: false, aliases: ["tui"] },
  { id: 15, name: "thùng", type: "package", allowDecimal: false, aliases: ["thung"] },
  { id: 16, name: "khay", type: "package", allowDecimal: false },
  { id: 17, name: "chai", type: "package", allowDecimal: false },
  { id: 18, name: "lon", type: "package", allowDecimal: false },
  { id: 19, name: "bịch", type: "package", allowDecimal: false, aliases: ["bich"] },
  { id: 20, name: "bó", type: "count", allowDecimal: false, aliases: ["bo"] },
  { id: 21, name: "cuộn", type: "count", allowDecimal: false, aliases: ["cuon"] },
  { id: 22, name: "hũ/lọ", type: "package", allowDecimal: false, aliases: ["hu/lo", "hu", "lo"] },
  { id: 23, name: "can", type: "package", allowDecimal: false },
];

const UNIT_KEYWORD_RULES: UnitKeywordRule[] = [
  {
    unitName: "hộp",
    priority: 5,
    keywords: ["cá hộp", "thịt hộp", "đồ hộp", "đóng hộp", "kem hộp"],
  },
  {
    unitName: "gói",
    priority: 4,
    keywords: [
      "mì gói", "cháo gói", "hạt nêm gói", "bột canh", "bột nở", "baking powder",
      "baking soda", "bột trà sữa", "bột kem béo", "gia vị gói",
    ],
  },
  {
    unitName: "chai",
    priority: 4,
    keywords: [
      "nước suối", "nước khoáng", "nước ngọt", "nước ép", "rượu", "vodka", "rum",
      "whisky", "tương ớt", "tương cà", "ketchup", "nước mắm", "nước tương", "xì dầu",
    ],
  },
  {
    unitName: "lon",
    priority: 4,
    keywords: ["nước ngọt lon", "bia lon", "soda", "sữa đặc"],
  },
  {
    unitName: "lít",
    priority: 3,
    keywords: [
      "dầu ăn", "dầu nành", "dầu hướng dương", "dầu dừa", "dầu phộng", "dầu lạc",
      "dầu chiên", "dầu thực vật", "dầu mè", "dầu ô liu", "sữa", "nước cốt dừa", "siro",
      "nước rửa chén", "nước rửa tay", "nước lau sàn", "nước giặt", "nước xả",
    ],
  },
  {
    unitName: "ml",
    priority: 3,
    keywords: ["whipping cream", "cream cheese", "kem tươi", "nước cốt chanh", "cồn", "sát khuẩn"],
  },
  {
    unitName: "kg",
    priority: 2,
    excludeKeywords: ["cá hộp", "thịt hộp", "đóng hộp", "hộp"],
    keywords: [
      "thịt", "sườn", "ba chỉ", "nạc", "thăn", "đùi", "gan", "lòng", "cá", "tôm", "mực", "cua",
      "ghẹ", "ốc", "sò", "hàu", "ngao", "nghêu", "bắp cải", "cà rốt", "khoai tây", "khoai lang",
      "bí đỏ", "măng", "nấm", "cà chua", "dưa leo", "giá đỗ", "đậu", "ngô", "gạo", "nếp", "bột mì",
      "bột gạo", "bột năng", "bột bắp", "tinh bột", "đường", "muối", "thịt xay", "cá file",
    ],
  },
  {
    unitName: "g",
    priority: 3,
    keywords: ["saffron", "vanilla", "nhụy hoa nghệ tây", "gelatin", "bột rau câu", "men"],
  },
  {
    unitName: "con",
    priority: 3,
    keywords: ["gà nguyên con", "vịt nguyên con", "cá nguyên con", "tôm hùm", "ếch", "lươn"],
  },
  {
    unitName: "quả",
    priority: 3,
    keywords: ["trứng", "chanh", "táo", "lê", "kiwi", "thanh long", "dâu tây", "ổi", "quýt", "nho"],
  },
  {
    unitName: "bó",
    priority: 3,
    keywords: [
      "rau muống", "rau cải", "cải bó xôi", "xà lách", "rau thơm", "rau mùi", "ngò", "húng",
      "tía tô", "kinh giới", "hẹ", "ngò gai", "rau răm", "rau diếp", "hành lá", "lá chanh", "lá lốt",
    ],
  },
  {
    unitName: "túi",
    priority: 3,
    keywords: ["túi nilon", "túi zip", "túi giấy", "túi rác", "bao rác"],
  },
  {
    unitName: "thùng",
    priority: 3,
    keywords: ["thùng", "carton", "thùng carton"],
  },
  {
    unitName: "khay",
    priority: 3,
    keywords: ["khay", "mâm", "khay nhựa", "khay giấy", "khay xốp"],
  },
  {
    unitName: "can",
    priority: 3,
    keywords: ["can", "can nhựa", "can dầu", "can nước"],
  },
  {
    unitName: "mét",
    priority: 2,
    keywords: ["dây", "ống", "ống nước", "dây điện", "dây buộc", "màng", "vải", "lưới"],
  },
  {
    unitName: "cm",
    priority: 2,
    keywords: ["tem", "nhãn", "decal", "kích thước", "chiều dài"],
  },
  {
    unitName: "cái",
    priority: 1,
    keywords: ["đậu phụ", "đậu hũ", "bánh tráng", "bánh đa", "vỏ bánh", "hộp cơm", "hộp đựng"],
  },
  {
    unitName: "chiếc",
    priority: 1,
    keywords: ["muỗng", "thìa", "nĩa", "đũa", "dao", "kéo", "xẻng", "kẹp", "rổ", "rá", "chậu"],
  },
  {
    unitName: "bộ",
    priority: 1,
    keywords: ["bộ dao", "bộ nồi", "bộ bát", "bộ dĩa", "set", "combo"],
  },
  {
    unitName: "cuộn",
    priority: 2,
    keywords: ["màng bọc thực phẩm", "giấy bạc", "giấy nến", "giấy lót", "khăn giấy"],
  },
  {
    unitName: "hũ/lọ",
    priority: 3,
    keywords: ["sa tế", "wasabi", "mù tạt", "mayonnaise", "mật ong", "chao", "hũ", "lọ"],
  },
  {
    unitName: "bịch",
    priority: 3,
    keywords: ["đá", "đá viên", "hộp xốp", "hộp nhựa", "khăn ướt", "bao tay", "găng tay"],
  },
];

// Danh sách đơn vị phổ biến cho nhà hàng (dùng khi API không khả dụng)
export const DEFAULT_UNITS: Unit[] = [
  ...UNIT_DEFINITIONS.map((unit) => ({ id: unit.id, name: unit.name })),
];

const findDefinitionByName = (unitName: string) => {
  const normalizedName = normalizeText(unitName);
  return UNIT_DEFINITIONS.find((unit) => {
    if (normalizeText(unit.name) === normalizedName) return true;
    return (unit.aliases || []).some((alias) => normalizeText(alias) === normalizedName);
  });
};

const resolveUnitByName = (unitName: string, units: Unit[]) => {
  const normalizedName = normalizeText(unitName);
  const fromApi = (units || []).find((unit) => normalizeText(unit.name) === normalizedName);
  if (fromApi) return fromApi;

  const definition = findDefinitionByName(unitName);
  if (!definition) return null;
  return { id: definition.id, name: definition.name };
};

export const getUnitMetaById = (unitId?: number) => {
  const definition = UNIT_DEFINITIONS.find((unit) => unit.id === Number(unitId));
  if (!definition) return null;
  return {
    type: definition.type,
    allowDecimal: definition.allowDecimal,
    name: definition.name,
  };
};

const inferFallbackUnitName = (materialName: string): string => {
  const normalized = normalizeText(materialName);

  if (
    ["nuoc", "dau", "sua", "siro", "syrup", "xot", "giam"].some((k) =>
      normalized.includes(k),
    )
  ) {
    return "lít";
  }

  const packageOrder: Array<{ name: string; keys: string[] }> = [
    { name: "hộp", keys: ["hop", "dong hop"] },
    { name: "gói", keys: ["goi"] },
    { name: "túi", keys: ["tui", "bao"] },
    { name: "chai", keys: ["chai"] },
    { name: "lon", keys: ["lon"] },
    { name: "thùng", keys: ["thung", "carton"] },
    { name: "can", keys: ["can"] },
  ];

  for (const item of packageOrder) {
    if (item.keys.some((k) => normalized.includes(k))) {
      return item.name;
    }
  }

  if (["rau", "la", "hanh", "ngo", "hung"].some((k) => normalized.includes(k))) {
    return "bó";
  }

  if (["trung", "chanh", "tao", "le"].some((k) => normalized.includes(k))) {
    return "quả";
  }

  return "kg";
};

/**
 * Tự động gợi ý đơn vị dựa trên tên nguyên liệu.
 * Trả về unitId + unitName phù hợp nhất, hoặc null nếu không tìm thấy.
 */
export function suggestUnit(
  materialName: string,
  units: Unit[] = DEFAULT_UNITS,
): UnitSuggestion | null {
  if (!materialName || materialName.trim().length < 2) return null;

  const normalizedName = normalizeText(materialName);

  let bestMatch: { unitName: string; score: number } | null = null;

  for (const rule of UNIT_KEYWORD_RULES) {
    const excluded = (rule.excludeKeywords || []).some((keyword) =>
      normalizedName.includes(normalizeText(keyword)),
    );

    if (excluded) continue;

    let score = 0;

    for (const keyword of rule.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) continue;

      const partialMatch = normalizedName.includes(normalizedKeyword);
      if (!partialMatch) continue;

      if (matchWholePhrase(normalizedName, normalizedKeyword)) {
        score += normalizedKeyword.length * 10;
      } else {
        score += normalizedKeyword.length * 3;
      }
    }

    score += (rule.priority || 0) * 100;

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = {
        unitName: rule.unitName,
        score,
      };
    }
  }

  const matchedUnitName = bestMatch?.unitName || inferFallbackUnitName(materialName);
  const matchedUnit = resolveUnitByName(matchedUnitName, units);

  if (!matchedUnit) return null;

  const definition = findDefinitionByName(matchedUnit.name);
  if (!definition) {
    return {
      unitId: matchedUnit.id,
      unitName: matchedUnit.name,
      unitType: "count",
      allowDecimal: false,
      confidence: bestMatch ? "medium" : "fallback",
    };
  }

  return {
    unitId: matchedUnit.id,
    unitName: matchedUnit.name,
    unitType: definition.type,
    allowDecimal: definition.allowDecimal,
    confidence: bestMatch ? "high" : "fallback",
  };
}

// ====== API SERVICE ======
export const unitService = {
  // GET all units from API
  getAllUnits: async (): Promise<Unit[]> => {
    try {
      const response = await apiClient.get<Unit[]>("/List");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("API Error:", error.response.status, error.response.data);
        } else if (error.request) {
          console.error("Network Error: Cannot connect to server");
        }
      }
      // Fallback to default units when API is not available
      console.warn("Using default units (backend API not available)");
      return DEFAULT_UNITS;
    }
  },

  // GET unit by ID
  getUnitById: async (id: number): Promise<Unit> => {
    try {
      const response = await apiClient.get<Unit>(`/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching unit:", error.message);
      }
      throw error;
    }
  },
};
