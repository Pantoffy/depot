# 📋 SCRIPT THUYẾT TRÌNH BẢO VỆ ĐỒ ÁN
## Hệ Thống Quản Lý Kho (Warehouse Management System)

---

## I. GIỚI THIỆU DỰ ÁN (2-3 phút)

### 1.1 Tên Đồ Án
**Hệ Thống Quản Lý Kho - Warehouse Management System (WMS)**

### 1.2 Mục Đích
- Quản lý toàn bộ quy trình kho xuất nhập hàng
- Theo dõi hàng tồn kho và vị trí lưu trữ
- Tối ưu hóa quy trình đặt hàng từ nhà cung cấp
- Cung cấp báo cáo tức thời về tình trạng kho

### 1.3 Đối Tượng Sử Dụng
- **Quản lý kho**: Duyệt phiếu nhập/xuất, quản lý tồn kho
- **Nhân viên kho**: Nhập liệu nhập/xuất hàng, kiểm kho
- **Quản lý bán hàng**: Tạo phiếu xuất hàng, theo dõi đơn
- **Giám đốc**: Xem báo cáo, thống kê tổng quan

### 1.4 Công Nghệ Sử Dụng
```
Frontend: React 18 + TypeScript + Tailwind CSS + React Router
Backend:  RESTful API (Node.js/Express)
Database: SQL (PostgreSQL/MySQL)
UI Library: Lucide React Icons, ApexCharts, Recharts
```

---

## II. KIẾN TRÚC HỆ THỐNG (2 phút)

### 2.1 Cấu Trúc Thư Mục
```
src/
├── pages/                    # Các trang chính
│   ├── Dashboard/           # Bảng điều khiển tổng quan
│   ├── Forms/               # Quản lý đơn đặt hàng
│   ├── Inventory/           # Quản lý tồn kho
│   ├── Reports/             # Báo cáo thống kê
│   └── AuthPages/           # Trang đăng nhập
├── components/              # Component tái sử dụng
│   ├── form/               # Form input components
│   ├── common/             # Common components
│   └── ui/                 # UI components
├── services/               # API services
│   ├── purchaseOrderService
│   ├── importService
│   ├── exportService
│   ├── inventoryService
│   ├── materialService
│   ├── supplierService
│   └── ...
├── context/                # React Context
│   ├── AuthContext         # Xác thực người dùng
│   ├── ThemeContext        # Light/Dark mode
│   └── SidebarContext      # Menu sidebar
└── layout/                 # Layout chính
```

### 2.2 Data Flow
```
User Interface (React Components)
           ↓
State Management (useState, useContext)
           ↓
Service Layer (API Calls)
           ↓
Backend API (RESTful)
           ↓
Database (SQL)
```

---

## III. CÁC TÍNH NĂNG CHÍNH (5-7 phút)

### 3.1 BẢNG ĐIỀU KHIỂN - Dashboard
**Vị trí**: Home page  
**Chức năng**:
- ✅ Thống kê KPI: Tổng vật tư, tổng nhà cung cấp, tồn kho
- ✅ Biểu đồ: Nhập/xuất theo tháng, top vật tư bán chạy
- ✅ Hoạt động gần đây: Lịch sử nhập/xuất/đặt hàng
- ✅ Cảnh báo: Hàng cắt hết, hàng hết hạn, tồn kho thấp
- ✅ Responsive design: Hoạt động trên desktop & mobile

**Cách vận hành**:
```
1. Click "Dashboard" hoặc vào home page
2. Xem các KPI cards
3. Tương tác với biểu đồ (hover, click)
4. Scroll xem activity feed
```

---

### 3.2 QUẢN LÝ ĐƠN ĐẶT HÀNG - Purchase Orders
**Vị trí**: Menu → Đơn đặt hàng  
**Trạng thái**:
- 📝 **Draft** (Nháp): Tạo mới, chưa submit
- ⏳ **Pending** (Chờ duyệt): Đã submit, chờ quản lý duyệt
- ✅ **Confirmed** (Đã duyệt): Quản lý đã duyệt
- 📦 **Delivered** (Đã giao): Nhà cung cấp giao hàng
- ❌ **Cancelled** (Hủy): Hủy đơn

**Chức Năng**:

#### 3.2.1 Danh Sách Đơn Đặt Hàng
```
✅ Tìm kiếm: Theo mã đơn, số PO, nhà cung cấp
✅ Lọc: Theo trạng thái
✅ Sắp xếp: Theo ngày, tổng tiền
✅ Phân trang: 10/20/50 dòng/trang
✅ Cột "Nhập Kho": 
   - Hiện phiếu nhập đang xử lý
   - Hoặc "Chưa có phiếu nhập"
```

**Cách vận hành**:
```
1. Click "Đơn đặt hàng" → Xem danh sách
2. Tìm kiếm: Nhập mã đơn hoặc số PO
3. Lọc theo status: Click filter button
4. Xem chi tiết: Click icon "mắt"
5. Sửa đơn: Click icon "bút chì" (chỉ Draft)
6. Xóa đơn: Click icon "thùng rác" (chỉ Draft)
```

#### 3.2.2 Tạo Đơn Đặt Hàng
```
Bước 1: Nhập thông tin cơ bản
  - Số PO (bắt buộc)
  - Ngày đặt
  - Ngày dự kiến giao
  - Nhà cung cấp (bắt buộc)

Bước 2: Thêm chi tiết đặt hàng
  - Chọn vật tư (bắt buộc)
  - Nhập số lượng (bắt buộc, > 0)
  - Nhập đơn giá (bắt buộc, >= 0)
  - Ghi chú (tùy chọn)
  - Click "Thêm hàng"

Bước 3: Kiểm tra & Lưu
  - Tổng tiền tự tính toán
  - Click "Lưu" → Đơn ở trạng thái Draft
  - Click "Gửi duyệt" → Chuyển Pending

Bước 4: Lưu thành công
  - Hiện toast "Đã tạo đơn đặt hàng"
  - Quay lại danh sách
```

#### 3.2.3 Chi Tiết Đơn Đặt Hàng
```
Xem:
  ✅ Thông tin đơn (mã, số PO, NCC, ngày)
  ✅ Chi tiết hàng (vật tư, SL, giá, thành tiền)
  ✅ Tính năng:
     - Xem PDF/In
     - Edit (chỉ Draft)
     - Gửi duyệt (Draft → Pending)
     - Xác nhận (Pending → Confirmed)
     - Hủy (chỉ Draft)
     - Đánh dấu đã giao (Confirmed → Delivered)
     
Nếu đã giao:
  - Nếu chưa nhập: Nút "Tạo phiếu nhập"
  - Nếu đang nhập: Badge "Đơn hàng đang được nhập tại phiếu nhập X"
```

---

### 3.3 QUẢN LÝ NHẬP HÀNG - Imports
**Vị trí**: Menu → Nhập kho  
**Chức Năng**:

#### 3.3.1 Danh Sách Phiếu Nhập
```
✅ Tìm kiếm: Theo mã phiếu, số phiếu, NCC
✅ Lọc: Theo trạng thái, kho
✅ Cột "Liên Kết PO": 
   - Hiện mã đơn đặt hàng
   - Hiện "Không liên kết" nếu độc lập
✅ Phân trang: 10/20/50 dòng/trang
```

**Cách vận hành**:
```
1. Click "Nhập kho" → Xem danh sách
2. Tìm kiếm phiếu nhập
3. Xem chi tiết: Click icon "mắt"
4. Tạo phiếu mới: Click "Thêm Phiếu Nhập"
```

#### 3.3.2 Tạo Phiếu Nhập
```
Cách 1: Từ danh sách
  1. Click "Thêm Phiếu Nhập"
  2. Nhập thông tin cơ bản

Cách 2: Từ đơn đặt hàng
  1. Xem chi tiết đơn đặt hàng (Delivered)
  2. Click "Tạo phiếu nhập"
  3. Auto-fill thông tin từ PO:
     - Nhà cung cấp
     - Vật tư & số lượng đặt
     - Liên kết PO (documentNo = PO code)

Các bước:
  1. Chọn kho (bắt buộc)
  2. Chọn nhà cung cấp (bắt buộc)
  3. Thêm chi tiết nhập:
     - Vật tư (bắt buộc)
     - Số lượng nhập (bắt buộc)
     - Tất cả lô (bắt buộc)
     - Ngày hết hạn (tùy)
     - Click "Thêm"
  4. Review & Lưu
     - Click "Lưu nháp" (Draft)
     - Click "Gửi duyệt" (Pending)

Trạng thái:
  - Draft → Pending → Approved
```

#### 3.3.3 Duyệt Phiếu Nhập
```
Quyền: Quản lý kho

Bước:
  1. Xem chi tiết phiếu (status = Pending)
  2. Kiểm tra:
     - Vật tư, số lượng, lô, hạn
     - Tồn kho trước/sau nhập
  3. Click "Duyệt phiếu"
     - Tương tác confirm
     - Phiếu → Approved
     - Cập nhật tồn kho
     - Hiện toast "Đã duyệt"

Nếu lỗi:
  - Click "Từ chối" → Hủy phiếu
  - Người tạo phải tạo lại
```

---

### 3.4 QUẢN LÝ XUẤT HÀNG - Exports
**Vị trí**: Menu → Xuất kho  
**Chức Năng**:

#### 3.4.1 Danh Sách Phiếu Xuất
```
✅ Tìm kiếm: Theo mã phiếu, loại xuất
✅ Lọc: Theo trạng thái, loại (bán hàng/nội bộ)
✅ Phân trang
```

#### 3.4.2 Loại Xuất Hàng
1. **Bán hàng**: Xuất cho khách hàng
   - Tạo hóa đơn
   - Giảm tồn kho

2. **Nội bộ**: Xuất tài sản nội bộ
   - Kiểm tra, bảo trì
   - Di chuyển kho

#### 3.4.3 Tạo Phiếu Xuất
```
Bước 1: Chọn loại xuất
  - Bán hàng
  - Nội bộ

Bước 2: Nhập thông tin
  - Kho (bắt buộc)
  - Khách hàng/Bộ phận (nếu cần)
  - Lý do xuất

Bước 3: Thêm chi tiết xuất
  - Chọn vật tư
  - Nhập số lượng xuất
  - Kiểm tra tồn kho
  - Click "Thêm"

Bước 4: Lưu & Gửi duyệt

Trạng thái:
  - Draft → Pending → Approved
```

---

### 3.5 QUẢN LÝ TỒN KHO - Inventory
**Vị trị**: Menu → Kho → Các tùy chọn  
**Chức Năng**:

#### 3.5.1 Tồn Kho Theo Kho
**Menu**: Kho → Tồn kho theo kho

```
✅ Bảng hiển thị:
   - Vật tư (mã, tên)
   - Số lượng tồn theo kho
   - Tổng tồn
   - Ghi chú

✅ Lọc: Theo kho
✅ Tìm kiếm: Theo vật tư
✅ Export Excel
```

**Cách vận hành**:
```
1. Click "Tồn kho theo kho"
2. Chọn lọc kho (nếu cần)
3. Tìm kiếm vật tư
4. Xem số lượng tồn
5. Export Excel: Click "Xuất Excel"
```

#### 3.5.2 Danh Sách Vật Tư
**Menu**: Kho → Danh sách vật tư

```
✅ Tìm kiếm: Theo mã, tên vật tư
✅ Cột hiển thị:
   - Mã vật tư
   - Tên
   - Loại (vật tư/hàng hóa)
   - Đơn vị
   - Tồn kho tổng
   - Trạng thái
```

#### 3.5.3 Danh Sách Nhà Cung Cấp
**Menu**: Kho → Nhà cung cấp

```
✅ Tìm kiếm: Theo tên NCC
✅ Cột hiển thị:
   - Tên NCC
   - Địa chỉ
   - Điện thoại
   - Email
   - Số lần cung cấp
```

#### 3.5.4 Danh Sách Kho
**Menu**: Kho → Danh sách kho

```
✅ Xem: Mã kho, tên, địa chỉ, người quản lý
✅ Thêm kho mới
✅ Sửa thông tin kho
```

#### 3.5.5 Kiểm Kho
**Menu**: Kho → Kiểm kho

```
Chức năng:
  ✅ Tạo phiếu kiểm kho
  ✅ Quét barcode / Nhập SL thực tế
  ✅ So sánh hệ thống vs thực tế
  ✅ Báo cáo chênh lệch
  ✅ Duyệt & Cập nhật tồn

Trạng thái:
  - Draft (đang kiểm)
  - Submitted (chờ duyệt)
  - Approved (đã kiểm)

Quyền:
  - Quản lý kho duyệt
  - Cập nhật tồn kho
```

---

### 3.6 BÁO CÁO & THỐNG KÊ - Reports
**Vị trí**: Menu → Báo cáo  
**Các loại báo cáo**:

#### 3.6.1 Nhật Ký Nhập/Xuất
```
- Thống kê nhập hàng theo ngày/tháng
- Thống kê xuất hàng theo ngày/tháng
- Filter: Kho, khoảng thời gian
- Chart: Bar chart, line chart
- Export: CSV, Excel
```

#### 3.6.2 Báo Cáo Tồn Kho
```
- Snapshot tồn kho hiện tại
- Vật tư, số lượng, giá trị
- Vật tư cắt hết, hết hạn
- Export: Excel
```

#### 3.6.3 Báo Cáo Nhà Cung Cấp
```
- Tổng số lượng từng NCC
- Tổng giá trị đặt hàng
- Tỷ lệ đơn giao đúng hạn
- Ranking NCC
```

#### 3.6.4 Báo Cáo Chi Phí
```
- Chi phí nhập hàng theo tháng
- Chi phí trung bình vật tư
- So sánh tháng trước
- Dự báo chi phí
```

---

## IV. QÚIVÀO LÀM VIỆC - Workflows (3-4 phút)

### 4.1 Quy Trình Đặt Hàng & Nhập Kho

```
┌─────────────────────────────────────────────────────────┐
│ 1. NHÂN VIÊN BÁN HÀNG / QUẢN LÝ KINH DOANH            │
└─────────────────────────────────────────────────────────┘
    ↓
    Tạo đơn đặt hàng (Draft)
    - Chọn NCC
    - Thêm vật tư & số lượng
    - Lưu thành Draft

┌─────────────────────────────────────────────────────────┐
│ 2. GỬI DUYỆT ĐƠN                                        │
└─────────────────────────────────────────────────────────┘
    ↓
    Đơn → Pending (Chờ duyệt)
    - Gửi thông báo cho Quản lý kho

┌─────────────────────────────────────────────────────────┐
│ 3. QUẢN LÝ KHO DUYỆT ĐƠN                              │
└─────────────────────────────────────────────────────────┘
    ↓
    Đơn → Confirmed (Đã duyệt)
    - Kiểm tra thông tin
    - Approve → Gửi cho NCC

┌─────────────────────────────────────────────────────────┐
│ 4. NHÀ CUNG CẤP GIAO HÀNG                             │
└─────────────────────────────────────────────────────────┘
    ↓
    Đơn → Delivered (Đã giao)
    - Quản lý kho cập nhật trạng thái

┌─────────────────────────────────────────────────────────┐
│ 5. NHẬP HÀNG VÀO KHO                                   │
└─────────────────────────────────────────────────────────┘
    ↓
    Cách 1: Từ đơn đặt hàng
      - Click "Tạo phiếu nhập"
      - Auto-fill: NCC, vật tư, SL
      
    Cách 2: Phiếu nhập độc lập
      - Tạo phiếu nhập từ menu

    ↓
    Phiếu nhập → Draft

┌─────────────────────────────────────────────────────────┐
│ 6. GỬI PHIẾU NHẬP DUYỆT                               │
└─────────────────────────────────────────────────────────┘
    ↓
    Phiếu → Pending
    - Kiểm tra vật tư, SL, lô, hạn
    - Tạo bản nháp

┌─────────────────────────────────────────────────────────┐
│ 7. QUẢN LÝ KHO DUYỆT PHIẾU NHẬP                       │
└─────────────────────────────────────────────────────────┘
    ↓
    Phiếu → Approved
    - Duyệt phiếu
    - ✅ Cập nhật tồn kho
    - ✅ Ghi nhận vào sổ nhập
    - ✅ Cập nhật ngày hết hạn vật tư

┌─────────────────────────────────────────────────────────┐
│ KẾT THÚC: Hàng đã vào kho                              │
└─────────────────────────────────────────────────────────┘

Liên kết:
- Phiếu nhập có field "documentNo"
- Lưu mã đơn đặt hàng hoặc số PO
- Dùng để match với đơn đặt hàng
- Hiển thị trong cột "Nhập kho" của danh sách PO
```

### 4.2 Quy Trình Xuất Hàng

```
┌─────────────────────────────────────────────────────────┐
│ 1. NHÂN VIÊN KINH DOANH TẠO PHIẾU XUẤT                │
└─────────────────────────────────────────────────────────┘
    ↓
    Chọn loại: Bán hàng / Nội bộ
    Nhập: Kho, khách hàng, lý do
    Thêm: Vật tư, SL xuất
    ↓
    Phiếu → Draft

┌─────────────────────────────────────────────────────────┐
│ 2. GỬI DUYỆT PHIẾU XUẤT                               │
└─────────────────────────────────────────────────────────┘
    ↓
    Phiếu → Pending

┌─────────────────────────────────────────────────────────┐
│ 3. QUẢN LÝ KHO DUYỆT PHIẾU XUẤT                       │
└─────────────────────────────────────────────────────────┘
    ↓
    Kiểm tra:
    - Tồn kho có đủ?
    - Số lượng, lô, hạn?
    
    ✅ Duyệt → Approved
       - Giảm tồn kho
       - Ghi nhận xuất
    
    ❌ Từ chối
       - Phiếu → Rejected
       - Không cập nhật tồn

┌─────────────────────────────────────────────────────────┐
│ KẾT THÚC: Hàng đã xuất kho                             │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Quy Trình Kiểm Kho

```
┌─────────────────────────────────────────────────────────┐
│ 1. NHÂN VIÊN KHO TẠO PHIẾU KIỂM KHO                   │
└─────────────────────────────────────────────────────────┘
    ↓
    Chọn kho
    Chọn vật tư cần kiểm
    ↓
    Phiếu → Draft

┌─────────────────────────────────────────────────────────┐
│ 2. QUÉT / NHẬP SỐ LƯỢNG THỰC TẾ                       │
└─────────────────────────────────────────────────────────┘
    ↓
    Cách 1: Quét barcode
    Cách 2: Nhập manual

    Hiển thị:
    - SL hệ thống
    - SL thực tế
    - Chênh lệch

┌─────────────────────────────────────────────────────────┐
│ 3. GỬI PHIẾU KIỂM DUYỆT                               │
└─────────────────────────────────────────────────────────┘
    ↓
    Phiếu → Submitted

┌─────────────────────────────────────────────────────────┐
│ 4. QUẢN LÝ KHO DUYỆT VÀ CẬP NHẬT TỒN KHO             │
└─────────────────────────────────────────────────────────┘
    ↓
    Kiểm tra phiếu
    ↓
    Nếu chênh lệch > ngưỡng:
    - Hỏi nhân viên kiểm
    - Điều tra, xác minh
    
    ✅ Duyệt → Approved
       - Cập nhật SL tồn kho
       - Ghi nhận chênh lệch
       - Ghi log thay đổi

┌─────────────────────────────────────────────────────────┐
│ KẾT THÚC: Tồn kho được chính xác hóa                   │
└─────────────────────────────────────────────────────────┘
```

---

## V. CÁC TÍNH NĂNG BỔ TRỢ (1-2 phút)

### 5.1 Xác Thực & Phân Quyền
```
Người dùng:
  ✅ Đăng nhập: Username + Password
  ✅ Phân quyền: Theo vai trò
  
Vai trò:
  1. Quản lý bán hàng
     - Xem dashboard
     - Tạo/sửa đơn đặt hàng
     - Tạo phiếu xuất
  
  2. Quản lý kho
     - Duyệt đơn đặt hàng
     - Duyệt phiếu nhập/xuất
     - Kiểm kho
  
  3. Nhân viên kho
     - Tạo phiếu nhập/xuất
     - Kiểm kho
     - Xem danh sách hàng
  
  4. Giám đốc
     - Xem toàn bộ báo cáo
     - Xem dashboard tổng quan
```

### 5.2 Dark Mode / Light Mode
```
✅ Toggle theme: Button góc trên phải
✅ Tự động lưu preference
✅ Áp dụng toàn bộ UI
```

### 5.3 Export & In
```
✅ Export Excel: 
   - Danh sách hàng
   - Báo cáo tồn kho
   - Lịch sử nhập/xuất

✅ In phiếu:
   - Phiếu nhập
   - Phiếu xuất
   - Đơn đặt hàng
```

### 5.4 Tìm Kiếm & Lọc
```
✅ Real-time search
✅ Lọc nhiều điều kiện
✅ Sắp xếp: Tăng/Giảm
✅ Phân trang: Tuỳ chọn số dòng
```

### 5.5 Thông Báo & Cảnh Báo
```
✅ Toast notification
✅ Modal confirm trước hành động
✅ Cảnh báo:
   - Hàng cắt hết
   - Hàng hết hạn
   - Tồn kho thấp
```

---

## VI. DEMO TƯƠNG TÁC (5-10 phút)

### 6.1 Demo 1: Tạo Đơn Đặt Hàng & Nhập Hàng

**Kịch bản**: Tạo PO mới → Duyệt → Ghi nhận đã giao → Tạo phiếu nhập

```
BƯỚC 1: Vào Đơn Đặt Hàng
  → Click Menu "Đơn đặt hàng"
  → Xem danh sách PO hiện có

BƯỚC 2: Tạo PO Mới
  → Click "Thêm Đơn Hàng"
  → Nhập số PO: "PO-2024-001"
  → Chọn NCC: "Công ty ABC"
  → Chọn vật tư: "Gạch xây dựng"
  → Nhập số lượng: 1000
  → Nhập đơn giá: 5000
  → Click "Thêm hàng"
  → Xem tổng tiền tự tính
  → Click "Lưu" → Đơn ở Draft

BƯỚC 3: Gửi Duyệt
  → Click "Xem chi tiết"
  → Click "Gửi duyệt"
  → Confirm
  → Đơn → Pending

BƯỚC 4: (Quản lý kho) Duyệt Đơn
  → Xem chi tiết đơn
  → Click "Xác nhận"
  → Confirm
  → Đơn → Confirmed

BƯỚC 5: Đánh Dấu Đã Giao
  → Click "Đánh dấu đã giao"
  → Confirm
  → Đơn → Delivered
  → Prompt: "Tạo phiếu nhập?"

BƯỚC 6: Tạo Phiếu Nhập
  → Click "Có, tạo phiếu nhập"
  → Navigate tới form nhập
  → Auto-fill: NCC, vật tư, SL
  → Thêm lô, hạn
  → Click "Lưu nháp"
  → Phiếu → Draft

BƯỚC 7: Duyệt Phiếu Nhập
  → Click "Gửi duyệt"
  → (Quản lý) Click "Duyệt"
  → Confirm
  → Phiếu → Approved
  → Tồn kho +1000
  → Xem badge trong danh sách PO:
    "Đơn PO-2024-001 đang được nhập vào phiếu X"
```

### 6.2 Demo 2: Xuất Hàng Cho Khách

**Kịch bản**: Tạo phiếu xuất → Duyệt → Giảm tồn kho

```
BƯỚC 1: Vào Xuất Kho
  → Click Menu "Xuất kho"
  → Click "Thêm Phiếu Xuất"

BƯỚC 2: Chọn Loại Xuất
  → Loại: "Bán hàng"
  → Kho: "Kho 1"
  → Khách: "Công ty XYZ"

BƯỚC 3: Thêm Chi Tiết
  → Vật tư: "Gạch xây dựng"
  → SL xuất: 500
  → Click "Thêm"
  → Tổng tự tính

BƯỚC 4: Lưu & Gửi Duyệt
  → Click "Gửi duyệt"
  → Phiếu → Pending

BƯỚC 5: Quản Lý Duyệt
  → Xem chi tiết
  → Kiểm tra tồn kho (1000, đủ)
  → Click "Duyệt"
  → Phiếu → Approved
  → Tồn kho: 1000 - 500 = 500
```

### 6.3 Demo 3: Kiểm Kho

**Kịch bản**: Tạo phiếu kiểm → Quét hàng → Duyệt

```
BƯỚC 1: Vào Kiểm Kho
  → Menu → Kho → Kiểm kho
  → Click "Tạo Phiếu Kiểm"

BƯỚC 2: Chọn Kho & Vật Tư
  → Kho: "Kho 1"
  → Vật tư: "Gạch xây dựng"
  → Click "Tạo"

BƯỚC 3: Quét / Nhập SL Thực Tế
  → Hệ thống: 500 cái
  → Quét barcode hoặc nhập: 480
  → Chênh lệch: -20 (hiện màu đỏ)

BƯỚC 4: Gửi Duyệt
  → Click "Gửi duyệt"
  → Phiếu → Submitted

BƯỚC 5: Quản Lý Xét Duyệt
  → Xem phiếu
  → Chênh -20 > ngưỡng?
  → Hỏi nhân viên kiểm
  → (Giải thích: hỏng 20 cái)
  → Click "Duyệt"
  → Phiếu → Approved
  → Tồn kho: 500 → 480
```

---

## VII. CÔNG NGHỆ & KIẾN TRÚC (1-2 phút)

### 7.1 Frontend
- **React 18**: UI library, hooks
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling, responsive
- **React Router**: Navigation
- **Context API**: State management (Auth, Theme, Sidebar)

### 7.2 Backend (Giới thiệu)
- **Node.js/Express**: API server
- **RESTful API**: Endpoints cho CRUD
- **Authentication**: JWT/Session

### 7.3 Database (Giới thiệu)
- **SQL**: PostgreSQL / MySQL
- **Tables**: 
  - PurchaseOrders
  - ImportReceipts
  - ExportReceipts
  - Inventory
  - Materials
  - Suppliers
  - Warehouses
  - Users
  - ...

### 7.4 Components Chính
```
Form Components:
  - FormInput: Input text
  - FormSelect: Dropdown
  - FormDatePicker: Date picker
  - FormTextarea: Textarea
  - MultiSelect: Chọn nhiều

UI Components:
  - Toast: Thông báo
  - ConfirmDialog: Xác nhận
  - Pagination: Phân trang
  - CustomSelect: Select custom
  - SearchableSelect: Select tìm kiếm

Charts:
  - ApexCharts: Biểu đồ KPI
  - Recharts: Biểu đồ trend
```

---

## VIII. MỘT SỐ ĐIỂM NỔI BẬT (1 phút)

### 8.1 Tính Năng Nổi Bật
✅ **Liên kết PO & Phiếu nhập**
- Auto-fill thông tin từ PO
- Hiển thị trạng thái trong danh sách

✅ **Responsive Design**
- Desktop, tablet, mobile
- Dark mode support

✅ **Real-time Calculation**
- Tổng tiền tự tính
- Tồn kho cập nhật instant

✅ **Audit Trail**
- Lịch sử thay đổi
- Ghi nhận người dùng & thời gian

✅ **Export & Report**
- Xuất Excel
- In phiếu
- Dashboard visualization

### 8.2 Quy Trình Được Tối Ưu
- Tối thiểu clicks → Tối đa hiệu suất
- Auto-fill → Giảm lỗi nhập liệu
- Validation → Dữ liệu chính xác
- Confirmation → Tránh thao tác nhầm

---

## IX. THÁCH THỨC & GIẢI PHÁP (1 phút)

### Thách Thức
1. **Dữ liệu lớn**: Hàng nghìn PO, lịch sử dài
   → Giải pháp: Phân trang, index DB

2. **Tính toán phức tạp**: Tồn kho, giá trị, báo cáo
   → Giải pháp: Caching, aggregation, job queue

3. **Đồng bộ dữ liệu**: API, DB, frontend
   → Giải pháp: Transaction, consistency check

4. **Bảo mật**: Quyền người dùng, dữ liệu nhạy cảm
   → Giải pháp: JWT, role-based access, encryption

5. **Hiệu năng**: Load time, response time
   → Giải pháp: Lazy loading, compression, CDN

---

## X. KẾ HOẠCH PHÁT TRIỂN TỚI (1 phút)

### Phase 2 (Tương lai)
- [ ] Barcode scanning
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Integration: Accounting, CRM
- [ ] Automation: Email notification, workflow
- [ ] Machine learning: Demand forecast

---

## XI. KẾT LUẬN (1 phút)

### Tóm Tắt
- ✅ Hệ thống quản lý kho toàn diện
- ✅ Quy trình nhập/xuất/kiểm tối ưu
- ✅ UI/UX thân thiện, responsive
- ✅ Công nghệ hiện đại (React, TypeScript, Tailwind)
- ✅ Dễ mở rộng, bảo trì

### Lợi Ích
1. **Giảm chi phí**: Tối ưu quy trình, giảm lỗi
2. **Tăng tốc độ**: Tự động hóa, real-time data
3. **Cải thiện chất lượng**: Kiểm soát chặt, audit trail
4. **Dễ quản lý**: Dashboard tổng quan, báo cáo chi tiết
5. **Mở rộng dễ dàng**: Code clean, modular

### Cảm Ơn
**Cảm ơn thầy (cô) và các bạn đã lắng nghe!**

---

## XII. Q&A - CÂU HỎI THƯỜNG GẶP

### Q: Làm thế nào để dữ liệu không bị mất?
**A**: 
- Database backup hàng ngày
- Transaction rollback nếu lỗi
- Audit log tất cả thay đổi

### Q: Phân quyền hoạt động như thế nào?
**A**:
- JWT token lưu role
- Middleware check role
- UI ẩn/hiện button theo quyền

### Q: Có thể export báo cáo dạng PDF không?
**A**:
- Hiện tại: Excel
- Tương lai: PDF, Google Sheets

### Q: Hệ thống có hỗ trợ multi-warehouse không?
**A**:
- Có! Chọn kho trong mỗi form
- Báo cáo theo kho

### Q: Làm sao nếu quên password?
**A**:
- Reset password qua email
- Hoặc admin reset manual

---

## CHÚC BẠN THUYẾT TRÌNH THÀNH CÔNG! 🎉
