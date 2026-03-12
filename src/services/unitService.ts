import axios from "axios";

// Interface matching Unit model
export interface Unit {
  id: number;
  name: string;
  description?: string;
}

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: "/api/Unit",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ====== KEYWORD-BASED AUTO-SUGGEST ======
// Gợi ý đơn vị dựa trên tên nguyên liệu.
// Khi tên chứa từ khóa, hệ thống sẽ gợi ý đơn vị phù hợp.

interface UnitKeywordRule {
  unitId: number;
  unitName: string;
  keywords: string[];
}

const UNIT_KEYWORD_RULES: UnitKeywordRule[] = [
  {
    unitId: 1,
    unitName: "kg",
    keywords: [
      // Thịt
      "thịt", "thịt bò", "thịt heo", "thịt lợn", "thịt gà", "thịt vịt",
      "sườn", "ba chỉ", "ba rọi", "nạc", "thăn", "đùi", "gan", "lòng",
      // Hải sản
      "cá", "tôm", "mực", "cua", "ghẹ", "ốc", "sò", "hàu", "ngao", "nghêu",
      // Rau củ (loại cân ký)
      "bắp cải", "cà rốt", "khoai tây", "khoai lang",
      "bí đỏ", "bí đao", "mướp", "măng", "nấm",
      "cà chua", "dưa chuột", "dưa leo", "giá đỗ", "giá",
      "đậu", "ngô", "bắp ngô",
      // Bột, gạo, đường, muối (mua sỉ theo kg)
      "gạo", "nếp", "bột mì", "bột gạo", "bột năng", "bột bắp", "tinh bột",
      "đường", "muối", "bột chiên giòn", "bột tempura", "bột sắn", "bột khoai",
      // Gia vị dạng củ/hạt mua theo kg
      "nghệ", "gừng", "tỏi", "hành", "tiêu", "quế", "hồi",
      // Trái cây (loại cân ký)
      "xoài", "dưa hấu", "cam", "bưởi", "đu đủ", "dứa", "chuối",
      // Tổng quát (đo lường khối lượng)
      "thịt xay", "cá file", "phô mai", "mozzarella", "parmesan", "cheddar",
    ],
  },
  {
    unitId: 2,
    unitName: "g",
    keywords: [
      // Gia vị đắt/hiếm, dùng lượng rất nhỏ
      "saffron", "vanilla", "nhụy hoa nghệ tây",
      // Bột gia vị (gói nhỏ)
      "gelatin", "bột rau câu", "men",
    ],
  },
  {
    unitId: 3,
    unitName: "lít",
    keywords: [
      // Dầu ăn (can/bình lớn)
      "dầu ăn", "dầu nành", "dầu hướng dương", "dầu dừa", "dầu phộng",
      "dầu lạc", "dầu chiên", "dầu thực vật", "dầu cooking",
      "dầu mè", "dầu ô liu",
      // Nước chấm (chai/can lớn)
      "nước mắm", "nước tương", "xì dầu", "giấm", "dầu hào",
      // Sữa
      "sữa", "sữa tươi", "sữa dừa", "nước cốt dừa",
      "buttermilk", "sữa chua",
      // Đồ uống (dạng mua sỉ theo lít)
      "siro", "syrup",
      // Vệ sinh
      "nước rửa chén", "nước rửa tay", "nước lau sàn",
      "nước tẩy", "nước giặt", "nước xả",
    ],
  },
  {
    unitId: 4,
    unitName: "ml",
    keywords: [
      // Kem sữa (hộp nhỏ)
      "whipping cream", "cream cheese", "kem tươi",
      "nước cốt chanh",
      "cồn", "dung dịch sát khuẩn",
    ],
  },
  {
    unitId: 5,
    unitName: "quả",
    keywords: [
      "trứng", "trứng gà", "trứng vịt", "trứng cút", "trứng muối",
      "chanh", "táo", "lê", "kiwi", "thanh long",
      "dâu tây", "cherry", "ổi", "quýt", "nho",
    ],
  },
  {
    unitId: 6,
    unitName: "con",
    keywords: [
      "gà nguyên con", "vịt nguyên con", "cá nguyên con",
      "tôm hùm", "ếch", "lươn",
    ],
  },
  {
    unitId: 7,
    unitName: "bó",
    keywords: [
      // Rau lá, rau thơm (mua theo bó)
      "rau muống", "rau cải", "cải bó xôi", "xà lách", "rau xà lách",
      "rau thơm", "rau mùi", "ngò", "húng", "húng tây", "tía tô", "kinh giới",
      "hẹ", "ngò gai", "rau răm", "rau diếp", "hành lá",
      "sả", "lá chanh", "lá lốt", "rau", "cải",
    ],
  },
  {
    unitId: 8,
    unitName: "hộp",
    keywords: [
      "cá hộp", "thịt hộp", "đồ hộp", "đóng hộp",
      "kem hộp",
    ],
  },
  {
    unitId: 9,
    unitName: "gói",
    keywords: [
      // Gia vị dạng gói
      "bột cà ri", "paprika", "oregano", "rosemary", "thyme",
      "bột tỏi", "bột hành", "ngũ vị hương", "bột năm loại",
      "ớt bột", "bột ớt", "đinh hương",
      "baking powder", "baking soda", "bột nở",
      // Đồ khô gói
      "mì gói", "cháo gói", "hạt nêm gói", "bột canh",
      "mực khô gói", "viên gia vị", "bột trà sữa",
      "bột kem béo", "bread crumbs",
      // Đồ gia vị gói nhỏ
      "hạt nêm",
    ],
  },
  {
    unitId: 10,
    unitName: "chai",
    keywords: [
      // Rượu bia
      "bia", "rượu", "rượu vang", "vodka", "rum", "whisky",
      "nước suối", "nước khoáng",
      // Đồ uống đóng chai
      "nước ngọt", "nước ép",
      // Nước chấm, sốt đóng chai
      "tương ớt", "tương cà", "ketchup",
      "sốt teriyaki", "sốt bbq", "sốt",
      "mắm tôm", "mắm ruốc", "mắm nêm",
    ],
  },
  {
    unitId: 11,
    unitName: "lon",
    keywords: [
      "nước ngọt lon", "bia lon",
      "soda",
      // Sữa đặc đóng lon
      "sữa đặc",
    ],
  },
  {
    unitId: 12,
    unitName: "túi",
    keywords: [
      "túi nilon", "túi zip", "túi đựng", "túi giấy", "túi rác", "bao rác",
    ],
  },
  {
    unitId: 13,
    unitName: "cuộn",
    keywords: [
      "màng bọc thực phẩm", "giấy bạc", "giấy nến", "bọc thực phẩm",
      "giấy lót", "khăn giấy",
    ],
  },
  {
    unitId: 14,
    unitName: "thùng",
    keywords: [
      "thùng", "carton", "thùng carton",
    ],
  },
  {
    unitId: 15,
    unitName: "hũ/lọ",
    keywords: [
      // Gia vị dạng paste/hũ
      "sa tế", "wasabi", "mù tạt", "mayonnaise",
      "me", "chao", "tương", "mật ong",
    ],
  },
  {
    unitId: 16,
    unitName: "tấm/miếng",
    keywords: [
      "đậu phụ", "đậu hũ", "bánh tráng", "bánh đa", "bánh phở",
      "vỏ bánh", "bacon", "jambon", "patê",
      "rong biển", "nori",
    ],
  },
  {
    unitId: 17,
    unitName: "cây",
    keywords: [
      // Gia vị dạng cây/khúc nguyên
      "xúc xích", "lạp xưởng", "giò", "chả",
    ],
  },
  {
    unitId: 18,
    unitName: "bịch",
    keywords: [
      "đá", "đá viên",
      "hộp xốp", "hộp nhựa", "hộp giấy", "hộp cơm",
      "hộp đựng thức ăn",
      "khăn ướt", "bao tay", "găng tay",
    ],
  },
];

// Danh sách đơn vị phổ biến cho nhà hàng (dùng khi API không khả dụng)
export const DEFAULT_UNITS: Unit[] = [
  { id: 1, name: "kg" },
  { id: 2, name: "g" },
  { id: 3, name: "lít" },
  { id: 4, name: "ml" },
  { id: 5, name: "quả" },
  { id: 6, name: "con" },
  { id: 7, name: "bó" },
  { id: 8, name: "hộp" },
  { id: 9, name: "gói" },
  { id: 10, name: "chai" },
  { id: 11, name: "lon" },
  { id: 12, name: "túi" },
  { id: 13, name: "cuộn" },
  { id: 14, name: "thùng" },
  { id: 15, name: "hũ/lọ" },
  { id: 16, name: "tấm/miếng" },
  { id: 17, name: "cây" },
  { id: 18, name: "bịch" },
];

/**
 * Tự động gợi ý đơn vị dựa trên tên nguyên liệu.
 * Trả về unitId + unitName phù hợp nhất, hoặc null nếu không tìm thấy.
 */
export function suggestUnit(materialName: string): { unitId: number; unitName: string } | null {
  if (!materialName || materialName.trim().length < 2) return null;

  const nameLower = materialName.toLowerCase().trim();

  let bestMatch: { unitId: number; unitName: string; score: number } | null = null;

  for (const rule of UNIT_KEYWORD_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (nameLower.includes(keyword)) {
        score += keyword.length;
      }
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = {
        unitId: rule.unitId,
        unitName: rule.unitName,
        score,
      };
    }
  }

  return bestMatch ? { unitId: bestMatch.unitId, unitName: bestMatch.unitName } : null;
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
