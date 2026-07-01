# BÁO CÁO ĐỒ ÁN TỐT NGHIỆP
## HỆ THỐNG QUẢN LÝ KHO HÀNG (WMS)

> Tài liệu nháp hoàn chỉnh (tiếng Việt) để chuyển đổi sang Word/PDF.
> 
> Repository phân tích chính: **Pantoffy/depot** (Frontend React + TypeScript).

---

## THÔNG TIN CHUNG

- **Tên đề tài:** Xây dựng hệ thống quản lý kho hàng
- **Sinh viên thực hiện:** ................................
- **Mã số sinh viên:** ................................
- **Giảng viên hướng dẫn:** ................................
- **Đơn vị thực tập (nếu có):** ................................
- **Thời gian thực hiện:** ................................

---

## MỤC LỤC

1. [Chương 1. Tổng quan đề tài](#chương-1-tổng-quan-đề-tài)
2. [Chương 2. Phân tích yêu cầu hệ thống](#chương-2-phân-tích-yêu-cầu-hệ-thống)
3. [Chương 3. Phân tích và thiết kế hệ thống](#chương-3-phân-tích-và-thiết-kế-hệ-thống)
4. [Chương 4. Cài đặt và kiểm thử](#chương-4-cài-đặt-và-kiểm-thử)
5. [Chương 5. Đánh giá kết quả và hướng phát triển](#chương-5-đánh-giá-kết-quả-và-hướng-phát-triển)
6. [Kết luận](#kết-luận)
7. [Phụ lục](#phụ-lục)

---

## Chương 1. Tổng quan đề tài

### 1.1. Lý do chọn đề tài
Trong hoạt động kho vận, việc quản lý nhập – xuất – tồn bằng sổ tay hoặc file rời rạc dễ gây thất thoát dữ liệu, sai số tồn kho và khó truy vết lịch sử giao dịch. Vì vậy, đề tài tập trung xây dựng hệ thống phần mềm giúp số hóa quy trình kho, tăng tính minh bạch và giảm thao tác thủ công.

### 1.2. Mục tiêu đề tài
- Xây dựng giao diện quản lý kho trực quan, dễ thao tác.
- Quản lý đầy đủ danh mục kho, vật tư, nhà cung cấp.
- Quản lý quy trình nghiệp vụ: phiếu nhập, phiếu xuất, đơn đặt hàng, kiểm kê.
- Theo dõi tồn kho đa kho và hỗ trợ báo cáo.
- Phân quyền sử dụng theo **2 tác nhân chính**.

### 1.3. Phạm vi đề tài
- **Trong phạm vi:** phần mềm quản lý kho cho doanh nghiệp vừa/nhỏ, tập trung vào nghiệp vụ nội bộ kho.
- **Ngoài phạm vi:** kế toán tài chính chuyên sâu, tích hợp ERP tổng thể, tối ưu vận tải giao hàng.

### 1.4. Công nghệ sử dụng
- Frontend: React, TypeScript, Vite, TailwindCSS.
- Giao tiếp dữ liệu: REST API.
- Công cụ kiểm tra mã nguồn: ESLint.

---

## Chương 2. Phân tích yêu cầu hệ thống

### 2.1. Tác nhân của hệ thống (chỉ gồm 2 tác nhân)

| Tác nhân | Vai trò nghiệp vụ |
|---|---|
| **Nhân viên kho** | Thực hiện nghiệp vụ hằng ngày: lập phiếu nhập/xuất, cập nhật kiểm kê, theo dõi tồn kho, tra cứu vật tư |
| **Quản lý kho** | Quản trị danh mục, phê duyệt/giám sát chứng từ, theo dõi dashboard & báo cáo, điều phối hoạt động kho |

### 2.2. Yêu cầu chức năng theo tác nhân

#### A. Nhân viên kho
1. Đăng nhập hệ thống.
2. Xem danh sách vật tư, kho, nhà cung cấp.
3. Tạo và cập nhật phiếu nhập kho.
4. Tạo và cập nhật phiếu xuất kho.
5. Tham gia lập phiếu kiểm kê, nhập số lượng thực tế.
6. Tra cứu tồn kho theo kho/vật tư.
7. Xem lịch sử giao dịch nhập – xuất.

#### B. Quản lý kho
1. Quản lý danh mục kho, loại kho, vật tư, đơn vị tính, nhà cung cấp.
2. Theo dõi và kiểm soát đơn đặt hàng.
3. Theo dõi dashboard tổng quan nhập – xuất – tồn.
4. Theo dõi báo cáo tồn kho, sổ kho, tồn theo kho.
5. Kiểm soát trạng thái chứng từ và hoạt động kiểm kê.
6. Nhận và xử lý thông báo nghiệp vụ quan trọng.

### 2.3. Danh sách use case chính

| Mã UC | Tên use case | Tác nhân |
|---|---|---|
| UC01 | Đăng nhập hệ thống | Nhân viên kho, Quản lý kho |
| UC02 | Quản lý kho hàng | Quản lý kho |
| UC03 | Quản lý vật tư | Quản lý kho |
| UC04 | Quản lý nhà cung cấp | Quản lý kho |
| UC05 | Lập phiếu nhập kho | Nhân viên kho |
| UC06 | Lập phiếu xuất kho | Nhân viên kho |
| UC07 | Quản lý đơn đặt hàng | Quản lý kho |
| UC08 | Kiểm kê kho | Nhân viên kho, Quản lý kho |
| UC09 | Theo dõi tồn kho và báo cáo | Nhân viên kho, Quản lý kho |
| UC10 | Theo dõi lịch và thông báo | Nhân viên kho, Quản lý kho |

### 2.4. Yêu cầu phi chức năng
- Giao diện thân thiện, thao tác nhanh.
- Dữ liệu hiển thị rõ ràng, hỗ trợ tiếng Việt.
- Phản hồi phù hợp trên các kích thước màn hình phổ biến.
- Dễ mở rộng thêm chức năng trong tương lai.

---

## Chương 3. Phân tích và thiết kế hệ thống

### 3.1. Kiến trúc tổng thể
Hệ thống vận hành theo mô hình client-server:

- **Client (repository Pantoffy/depot):** giao diện web cho người dùng.
- **Server API:** xử lý nghiệp vụ, lưu trữ dữ liệu, cấp dữ liệu cho frontend.

Luồng xử lý:
1. Người dùng thao tác trên giao diện.
2. Frontend gọi service tương ứng trong `src/services`.
3. API xử lý và trả kết quả.
4. Frontend cập nhật danh sách/báo cáo/thông báo theo dữ liệu mới.

### 3.2. Cấu trúc frontend theo mã nguồn

- `src/pages/AuthPages`: màn hình đăng nhập.
- `src/pages/Dashboard/Home.tsx`: thống kê tổng quan.
- `src/pages/Forms`: nghiệp vụ chứng từ (`Import.tsx`, `Export.tsx`, `PurchaseOrder.tsx`, `StockCheck.tsx`).
- `src/pages/Inventory`: danh mục và báo cáo (`Warehouse.tsx`, `Materials.tsx`, `Suppliers.tsx`, `StockByWarehouse.tsx`, `StockLedgerReport.tsx`).
- `src/pages/Calendar.tsx`: lịch nghiệp vụ.
- `src/services`: lớp gọi API theo từng miền nghiệp vụ.

### 3.3. Phân tích chức năng chi tiết

#### 3.3.1. Chức năng xác thực
- Kiểm tra tài khoản người dùng trước khi cho phép truy cập.
- Bảo vệ các màn hình nghiệp vụ theo trạng thái đăng nhập.

#### 3.3.2. Quản lý kho hàng
- Quản lý thông tin kho: mã kho, tên kho, loại kho, địa chỉ, diện tích, người quản lý, trạng thái.
- Cho phép thêm/sửa/xem chi tiết kho.

#### 3.3.3. Quản lý vật tư
- Quản lý mã vật tư, tên vật tư, đơn vị tính, nhà cung cấp, ghi chú.
- Hỗ trợ tra cứu nhanh và phục vụ nghiệp vụ nhập/xuất.

#### 3.3.4. Quản lý nhà cung cấp
- Lưu thông tin liên hệ và theo dõi mối liên kết với chứng từ nhập hàng.

#### 3.3.5. Phiếu nhập kho
- Nhân viên kho tạo phiếu nhập cho các lô hàng đến kho.
- Lưu danh sách vật tư, số lượng, đơn giá, kho nhận.
- Sau khi hợp lệ, tồn kho được cập nhật tăng.

#### 3.3.6. Phiếu xuất kho
- Nhân viên kho tạo phiếu xuất cho mục đích cấp phát/chuyển kho.
- Kiểm soát thông tin vật tư và số lượng xuất.
- Sau khi hợp lệ, tồn kho được cập nhật giảm.

#### 3.3.7. Đơn đặt hàng
- Quản lý kho theo dõi nhu cầu mua vật tư và đơn đặt hàng với nhà cung cấp.
- Dễ đối chiếu giữa đơn đặt hàng và phiếu nhập thực tế.

#### 3.3.8. Kiểm kê kho
- Tạo đợt kiểm kê, phân công nhân sự kiểm kê.
- Ghi nhận số lượng thực đếm và so sánh với số lượng hệ thống.
- Hỗ trợ kiểm soát chênh lệch tồn kho.

#### 3.3.9. Báo cáo tồn kho
- Báo cáo tồn theo kho (`StockByWarehouse`).
- Báo cáo sổ kho/lịch sử nhập xuất (`StockLedgerReport`).
- Hỗ trợ nhà quản lý ra quyết định nhập/xuất và điều phối.

#### 3.3.10. Lịch và thông báo
- Theo dõi sự kiện liên quan đến kho theo thời gian.
- Hỗ trợ nhắc việc và theo dõi hoạt động nghiệp vụ.

### 3.4. Luồng nghiệp vụ cốt lõi

#### Luồng 1: Nhập kho
1. Nhân viên kho tiếp nhận hàng.
2. Tạo phiếu nhập và khai báo chi tiết.
3. Hệ thống lưu chứng từ.
4. Tồn kho tăng tương ứng.
5. Quản lý kho theo dõi trên dashboard/báo cáo.

#### Luồng 2: Xuất kho
1. Nhân viên kho tạo phiếu xuất.
2. Kiểm tra thông tin vật tư/số lượng.
3. Hệ thống lưu chứng từ.
4. Tồn kho giảm tương ứng.
5. Quản lý kho giám sát biến động tồn.

#### Luồng 3: Kiểm kê
1. Quản lý kho lập kế hoạch kiểm kê.
2. Nhân viên kho thực hiện đếm thực tế.
3. Ghi nhận kết quả kiểm kê.
4. So sánh dữ liệu thực tế và hệ thống.
5. Hoàn tất biên bản kiểm kê để theo dõi chênh lệch.

---

## Chương 4. Cài đặt và kiểm thử

### 4.1. Môi trường triển khai
- Node.js + npm.
- Cài đặt: `npm ci`
- Chạy phát triển: `npm run dev`
- Kiểm tra code: `npm run lint`
- Build: `npm run build`

### 4.2. Các kịch bản kiểm thử tiêu biểu

| STT | Kịch bản | Tác nhân | Kết quả mong đợi |
|---|---|---|---|
| 1 | Đăng nhập với tài khoản hợp lệ | Nhân viên kho/Quản lý kho | Vào hệ thống thành công |
| 2 | Tạo phiếu nhập với dữ liệu hợp lệ | Nhân viên kho | Phiếu nhập được lưu, tồn kho tăng |
| 3 | Tạo phiếu xuất | Nhân viên kho | Phiếu xuất được lưu, tồn kho giảm |
| 4 | Xem báo cáo tồn theo kho | Quản lý kho | Hiển thị số liệu đúng theo kho |
| 5 | Tạo đợt kiểm kê và nhập kết quả | Nhân viên kho, Quản lý kho | Có kết quả đối chiếu tồn kho |
| 6 | Quản lý danh mục kho/vật tư/nhà cung cấp | Quản lý kho | Dữ liệu danh mục cập nhật đúng |

### 4.3. Đánh giá kết quả kiểm thử
- Các luồng chính (đăng nhập, nhập, xuất, kiểm kê, xem báo cáo) đáp ứng mục tiêu nghiệp vụ quản lý kho.
- Giao diện phân tách rõ nhóm chức năng, phù hợp cho 2 tác nhân chính.

---

## Chương 5. Đánh giá kết quả và hướng phát triển

### 5.1. Kết quả đạt được
- Hoàn thiện bộ chức năng cốt lõi của một hệ thống quản lý kho.
- Hỗ trợ vận hành thực tế với dữ liệu danh mục và chứng từ đầy đủ.
- Tăng khả năng theo dõi nhập – xuất – tồn theo thời gian.

### 5.2. Hạn chế
- Chưa phân tích sâu dữ liệu dự báo nhu cầu vật tư.
- Chưa mở rộng sang bài toán tối ưu vận tải/giao nhận.
- Chưa tích hợp sâu với các hệ thống doanh nghiệp khác.

### 5.3. Hướng phát triển
- Bổ sung cảnh báo tồn kho thông minh theo ngưỡng và xu hướng tiêu thụ.
- Mở rộng báo cáo phân tích theo kỳ, theo nhóm vật tư.
- Tích hợp mã vạch/QR để tăng tốc tác nghiệp tại kho.
- Bổ sung nhật ký thao tác phục vụ kiểm soát nội bộ.

---

## Kết luận
Đề tài đã xây dựng được hệ thống quản lý kho hàng có tính ứng dụng thực tế, bao quát các quy trình quan trọng gồm quản lý danh mục, nhập kho, xuất kho, kiểm kê và báo cáo tồn kho. Việc chuẩn hóa nghiệp vụ theo **2 tác nhân: Nhân viên kho và Quản lý kho** giúp hệ thống rõ trách nhiệm, dễ vận hành và phù hợp mục tiêu triển khai trong môi trường doanh nghiệp.

---

## Phụ lục

### Phụ lục A – Thành phần mã nguồn frontend được phân tích
- `src/pages/AuthPages`
- `src/pages/Dashboard/Home.tsx`
- `src/pages/Forms/Import.tsx`
- `src/pages/Forms/Export.tsx`
- `src/pages/Forms/PurchaseOrder.tsx`
- `src/pages/Forms/StockCheck.tsx`
- `src/pages/Inventory/Warehouse.tsx`
- `src/pages/Inventory/Materials.tsx`
- `src/pages/Inventory/Suppliers.tsx`
- `src/pages/Inventory/StockByWarehouse.tsx`
- `src/pages/Inventory/StockLedgerReport.tsx`
- `src/pages/Calendar.tsx`
- `src/services/*.ts`

### Phụ lục B – Gợi ý chuyển sang Word
1. Mở file Markdown bằng VS Code hoặc Typora.
2. Xuất sang `.docx` hoặc copy sang mẫu Word của trường.
3. Bổ sung thông tin cá nhân, hình ảnh giao diện, sơ đồ use case/ERD theo yêu cầu hội đồng.
