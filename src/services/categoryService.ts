import axios from "axios";

// Interface matching Category model
export interface Category {
  id: number;
  name: string;
  description?: string;
}

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: "/api/Category",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ====== KEYWORD-BASED AUTO-CLASSIFICATION ======
// Bảng quy tắc: mỗi danh mục có danh sách từ khóa liên quan.
// Khi tên nguyên liệu chứa từ khóa nào, hệ thống sẽ gợi ý danh mục tương ứng.
// Bạn có thể chỉnh sửa/mở rộng bảng này theo nhu cầu.

interface CategoryKeywordRule {
  categoryId: number;
  categoryName: string;
  keywords: string[]; // Từ khóa (lowercase, tiếng Việt không dấu + có dấu)
}

const CATEGORY_KEYWORD_RULES: CategoryKeywordRule[] = [
  {
    categoryId: 1,
    categoryName: "Thịt",
    keywords: [
      "thịt", "thịt bò", "thịt heo", "thịt lợn", "thịt gà", "thịt vịt",
      "thịt ngan", "thịt cừu", "thịt dê", "sườn", "ba chỉ", "ba rọi",
      "nạc", "thăn", "đùi", "cánh gà", "lòng", "gan", "tim", "mề",
      "giò", "chả", "xúc xích", "lạp xưởng", "bacon", "jambon",
      "thịt xay", "thịt viên", "bò viên", "nem", "patê",
      "thịt đông lạnh", "gà nguyên con", "vịt nguyên con",
    ],
  },
  {
    categoryId: 2,
    categoryName: "Hải sản",
    keywords: [
      "cá", "tôm", "mực", "cua", "ghẹ", "ốc", "sò", "hàu", "ngao",
      "nghêu", "hến", "bạch tuộc", "cá hồi", "cá thu", "cá basa",
      "cá tra", "cá diêu hồng", "cá chép", "cá lóc", "cá rô",
      "cá ngừ", "tôm sú", "tôm thẻ", "tôm hùm", "cá file",
      "cá viên", "surimi", "hải sản", "thủy sản", "cá đông lạnh",
      "tôm đông lạnh", "mực đông lạnh", "lươn", "ếch",
      "chả cá", "cá khô", "tôm khô", "mực khô",
    ],
  },
  {
    categoryId: 3,
    categoryName: "Rau củ quả",
    keywords: [
      "rau", "củ", "quả", "rau muống", "rau cải", "cải thảo", "cải bó xôi",
      "xà lách", "rau xà lách", "bắp cải", "súp lơ", "bông cải",
      "cà rốt", "khoai tây", "khoai lang", "hành", "tỏi", "gừng",
      "ớt", "cà chua", "dưa chuột", "dưa leo", "bí đao", "bí đỏ",
      "mướp", "đậu", "đậu phụ", "nấm", "nấm rơm", "nấm hương",
      "nấm kim châm", "nấm đùi gà", "măng", "giá đỗ", "giá",
      "rau thơm", "rau mùi", "ngò", "húng", "tía tô", "kinh giới",
      "sả", "lá chanh", "lá lốt", "hẹ", "ngò gai",
      "rau răm", "rau diếp", "bắp ngô", "ngô",
    ],
  },
  {
    categoryId: 4,
    categoryName: "Gia vị",
    keywords: [
      "gia vị", "muối", "đường", "tiêu", "bột ngọt", "hạt nêm",
      "nước mắm", "nước tương", "xì dầu", "tương ớt", "tương cà",
      "mắm tôm", "mắm ruốc", "mắm nêm", "dầu hào", "giấm",
      "sa tế", "ớt bột", "nghệ", "quế", "hồi", "đinh hương",
      "bột cà ri", "wasabi", "mù tạt", "mayonnaise", "ketchup",
      "nước cốt chanh", "me", "bột năm loại", "ngũ vị hương",
      "lá nguyệt quế", "bột ớt", "paprika", "oregano", "húng tây",
      "rosemary", "thyme", "bột tỏi", "bột hành", "dầu mè",
      "dầu ô liu", "sốt", "sốt teriyaki", "sốt bbq",
    ],
  },
  {
    categoryId: 5,
    categoryName: "Dầu mỡ",
    keywords: [
      "dầu ăn", "dầu nành", "dầu hướng dương", "dầu dừa", "dầu phộng",
      "dầu lạc", "dầu chiên", "mỡ", "mỡ heo", "mỡ lợn",
      "bơ", "bơ lạt", "bơ mặn", "margarine", "shortening",
      "dầu cooking", "dầu thực vật", "bơ thực vật",
    ],
  },
  {
    categoryId: 6,
    categoryName: "Lương thực",
    keywords: [
      "gạo", "nếp", "bột mì", "bột gạo", "bột năng", "bột bắp",
      "bột nở", "baking powder", "baking soda", "tinh bột",
      "bột chiên giòn", "bột tempura", "bột báng", "bột sắn",
      "bột khoai", "miến", "phở", "bún", "mì", "mì sợi",
      "mì ý", "pasta", "spaghetti", "nui", "hủ tiếu",
      "bánh đa", "bánh tráng", "bánh phở", "cháo", "xôi",
      "bột chiên", "bread crumbs", "vỏ bánh",
    ],
  },
  {
    categoryId: 7,
    categoryName: "Sữa & Trứng",
    keywords: [
      "sữa", "sữa tươi", "sữa đặc", "sữa bột", "kem", "kem tươi",
      "whipping cream", "cream cheese", "phô mai", "cheese",
      "mozzarella", "parmesan", "cheddar", "brie",
      "trứng", "trứng gà", "trứng vịt", "trứng cút", "trứng muối",
      "sữa chua", "yogurt", "bơ sữa", "buttermilk",
      "sữa dừa", "nước cốt dừa", "kem phủ",
    ],
  },
  {
    categoryId: 8,
    categoryName: "Đồ uống",
    keywords: [
      "cà phê", "trà", "trà xanh", "trà đen", "trà ô long",
      "matcha", "cacao", "chocolate", "siro", "syrup",
      "nước ngọt", "nước suối", "nước khoáng", "soda",
      "bia", "rượu", "rượu vang", "vodka", "rum", "whisky",
      "đá", "đá viên", "topping", "trân châu", "thạch",
      "nước ép", "sinh tố", "smoothie", "bột trà sữa",
      "đường nâu", "mật ong", "nước dừa", "chanh",
      "sữa pha trà", "creamer", "bột kem béo",
    ],
  },
  {
    categoryId: 9,
    categoryName: "Đồ khô",
    keywords: [
      "đồ khô", "đóng hộp", "cá hộp", "thịt hộp", "đồ hộp",
      "mì gói", "cháo gói", "lạc", "đậu phộng", "hạt điều",
      "hạt tiêu", "hạt sen", "đậu xanh", "đậu đỏ", "đậu đen",
      "đậu nành", "mè", "vừng", "rong biển", "tảo biển", "nori",
      "kim chi", "dưa muối", "tương", "đậu hũ", "chao",
      "bột canh", "viên gia vị", "hạt nêm gói", "thanh cua",
      "tôm khô", "mực khô gói", "măng khô", "mộc nhĩ",
      "nấm hương khô", "miến dong", "bò khô", "khô gà",
    ],
  },
  {
    categoryId: 10,
    categoryName: "Vật dụng",
    keywords: [
      "hộp xốp", "hộp nhựa", "hộp giấy", "túi nilon", "túi zip",
      "màng bọc thực phẩm", "giấy bạc", "giấy nến", "bao tay",
      "găng tay", "khăn giấy", "khăn ướt", "ống hút", "ly nhựa",
      "ly giấy", "đũa", "thìa", "muỗng", "nĩa", "dao",
      "tăm", "bao bì", "túi đựng", "hộp đựng thức ăn",
      "giấy lót", "khăn ăn", "bọc thực phẩm",
      "hộp cơm", "túi giấy", "cốc giấy", "nắp ly",
    ],
  },
  {
    categoryId: 11,
    categoryName: "Vệ sinh",
    keywords: [
      "nước rửa chén", "nước rửa tay", "nước lau sàn", "chất tẩy",
      "xà phòng", "xà bông", "nước tẩy", "cồn", "dung dịch sát khuẩn",
      "bột giặt", "nước giặt", "nước xả", "chổi", "cây lau nhà",
      "giẻ lau", "khăn lau", "bao rác", "túi rác",
      "vệ sinh", "tẩy rửa", "diệt khuẩn", "khử trùng",
    ],
  },
  {
    categoryId: 12,
    categoryName: "Tráng miệng",
    keywords: [
      "trái cây", "hoa quả", "cam", "táo", "nho", "xoài", "dưa hấu",
      "thanh long", "ổi", "bưởi", "quýt", "lê", "đào", "mận",
      "dâu tây", "việt quất", "kiwi", "cherry", "dứa", "thơm",
      "chuối", "đu đủ", "chôm chôm", "nhãn", "vải", "sapoche",
      "bánh ngọt", "bánh kem", "pudding", "chè", "tráng miệng",
      "kem que", "kem hộp", "sorbet", "mousse", "flan",
      "gelatin", "bột rau câu", "thạch rau câu",
    ],
  },
];

/**
 * Tự động gợi ý danh mục dựa trên tên nguyên liệu.
 * Trả về categoryId phù hợp nhất, hoặc null nếu không tìm thấy.
 * 
 * Thuật toán: đếm số từ khóa trùng khớp cho mỗi danh mục,
 * ưu tiên danh mục có nhiều từ khóa trùng nhất.
 */
export function suggestCategory(materialName: string): { categoryId: number; categoryName: string } | null {
  if (!materialName || materialName.trim().length < 2) return null;

  const nameLower = materialName.toLowerCase().trim();

  let bestMatch: { categoryId: number; categoryName: string; score: number } | null = null;

  for (const rule of CATEGORY_KEYWORD_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (nameLower.includes(keyword)) {
        // Longer keyword matches are weighted more heavily
        score += keyword.length;
      }
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = {
        categoryId: rule.categoryId,
        categoryName: rule.categoryName,
        score,
      };
    }
  }

  if (bestMatch) {
    return { categoryId: bestMatch.categoryId, categoryName: bestMatch.categoryName };
  }

  return null;
}

/**
 * Lấy tất cả quy tắc keyword hiện tại (để hiển thị hoặc debug).
 */
export function getCategoryKeywordRules(): CategoryKeywordRule[] {
  return CATEGORY_KEYWORD_RULES;
}

// Danh sách danh mục mặc định (dùng khi API không khả dụng)
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: "Thịt" },
  { id: 2, name: "Hải sản" },
  { id: 3, name: "Rau củ quả" },
  { id: 4, name: "Gia vị" },
  { id: 5, name: "Dầu mỡ" },
  { id: 6, name: "Lương thực" },
  { id: 7, name: "Sữa & Trứng" },
  { id: 8, name: "Đồ uống" },
  { id: 9, name: "Đồ khô" },
  { id: 10, name: "Vật dụng" },
  { id: 11, name: "Vệ sinh" },
  { id: 12, name: "Tráng miệng" },
];

// ====== API SERVICE ======
export const categoryService = {
  // GET all categories from API
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get<Category[]>("/List");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("API Error:", error.response.status, error.response.data);
        } else if (error.request) {
          console.error("Network Error: Cannot connect to server");
        }
      }
      throw error;
    }
  },

  // GET category by ID
  getCategoryById: async (id: number): Promise<Category> => {
    try {
      const response = await apiClient.get<Category>(`/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching category:", error.message);
      }
      throw error;
    }
  },
};
