USE Depot;
GO

/* =====================================================
   CLEAN DATA
===================================================== */
DELETE FROM StockCheckDetail;
DELETE FROM StockCheckTeam;
DELETE FROM StockCheck;
DELETE FROM ImportReceiptDetail;
DELETE FROM ImportReceipt;
DELETE FROM ExportReceiptDetail;
DELETE FROM ExportReceipt;
DELETE FROM PurchaseOrderDetail;
DELETE FROM PurchaseOrder;
DELETE FROM Inventory;
DELETE FROM Materials;
DELETE FROM Suppliers;
DELETE FROM Warehouse;
GO

/* =====================================================
   SUPPLIERS (50) - Nhà cung cấp cho nhà hàng / quán lẩu
===================================================== */
INSERT INTO Suppliers (code, type, name, contactPerson, title, phone, email, role, citizenId, address, status) VALUES
(N'SUP001', N'Công ty', N'Công ty TNHH Thực Phẩm Sạch Việt', N'Nguyễn Văn An', N'Giám đốc', '0901000001', 'thucphamsach@mail.com', N'Nhà cung cấp', '001099000001', N'123 Lý Thường Kiệt, Q.10, TP.HCM', N'Hoạt động'),
(N'SUP002', N'Công ty', N'Công ty CP Thịt Sạch Sagrifood', N'Trần Thị Bình', N'Phó GĐ', '0901000002', 'sagrifood@mail.com', N'Nhà cung cấp', '001099000002', N'45 Nguyễn Huệ, Q.1, TP.HCM', N'Hoạt động'),
(N'SUP003', N'Công ty', N'Công ty TNHH Hải Sản Biển Đông', N'Lê Minh Cường', N'Giám đốc', '0901000003', 'haisanbiendong@mail.com', N'Nhà cung cấp', '001099000003', N'78 Trần Phú, Vũng Tàu', N'Hoạt động'),
(N'SUP004', N'Công ty', N'Công ty TNHH Rau Củ Đà Lạt Xanh', N'Phạm Đức Dũng', N'Trưởng phòng', '0901000004', 'raudalat@mail.com', N'Nhà cung cấp', '001099000004', N'12 Lê Lợi, Đà Lạt', N'Hoạt động'),
(N'SUP005', N'Công ty', N'Công ty TNHH Gia Vị Á Châu', N'Hoàng Thị Em', N'Giám đốc', '0901000005', 'giaviac@mail.com', N'Nhà cung cấp', '001099000005', N'90 Hai Bà Trưng, Q.3, TP.HCM', N'Hoạt động'),
(N'SUP006', N'Công ty', N'Công ty CP Nước Giải Khát Sài Gòn', N'Vũ Văn Phúc', N'Giám đốc', '0901000006', 'nuocsgn@mail.com', N'Nhà cung cấp', '001099000006', N'56 Nguyễn Trãi, Q.5, TP.HCM', N'Hoạt động'),
(N'SUP007', N'Công ty', N'Công ty TNHH Bia Sài Gòn', N'Đỗ Thị Giang', N'Phó GĐ', '0901000007', 'biasaigon@mail.com', N'Nhà cung cấp', '001099000007', N'34 CMT8, Q.10, TP.HCM', N'Hoạt động'),
(N'SUP008', N'Cá nhân', N'Ngô Quang Hải - Trang trại gà', N'Ngô Quang Hải', N'Chủ trại', '0901000008', 'gahai@mail.com', N'Nhà cung cấp', '001099000008', N'Xã Long Khánh, Đồng Nai', N'Hoạt động'),
(N'SUP009', N'Công ty', N'Công ty CP Nước Mắm Phú Quốc', N'Bùi Văn Ích', N'Trưởng phòng', '0901000009', 'nuocmampq@mail.com', N'Nhà cung cấp', '001099000009', N'67 Phan Đình Phùng, Phú Quốc', N'Hoạt động'),
(N'SUP010', N'Công ty', N'Công ty TNHH Bún Phở Tươi Sài Gòn', N'Trịnh Thị Kim', N'Giám đốc', '0901000010', 'bunphotuoi@mail.com', N'Nhà cung cấp', '001099000010', N'101 Võ Văn Tần, Q.3, TP.HCM', N'Hoạt động'),
(N'SUP011', N'Công ty', N'Công ty CP Dầu Ăn Tường An', N'Lý Văn Long', N'Giám đốc', '0901000011', 'dautuongan@mail.com', N'Nhà cung cấp', '001099000011', N'200 Điện Biên Phủ, Q.Bình Thạnh', N'Hoạt động'),
(N'SUP012', N'Công ty', N'Công ty TNHH Thiết Bị Bếp Công Nghiệp', N'Mai Thị Mơ', N'Phó GĐ', '0901000012', 'thietbibep@mail.com', N'Nhà cung cấp', '001099000012', N'88 Nguyễn Văn Cừ, Q.5, TP.HCM', N'Hoạt động'),
(N'SUP013', N'Cá nhân', N'Phan Văn Nam - Vựa tôm cá', N'Phan Văn Nam', N'Chủ vựa', '0901000013', 'vuatomca@mail.com', N'Nhà cung cấp', '001099000013', N'Chợ Bình Điền, Q.8, TP.HCM', N'Hoạt động'),
(N'SUP014', N'Công ty', N'Công ty CP Đông Lạnh Vissan', N'Đinh Văn Ơn', N'Trưởng phòng', '0901000014', 'vissan@mail.com', N'Nhà cung cấp', '001099000014', N'KCN Tân Tạo, Bình Tân', N'Hoạt động'),
(N'SUP015', N'Công ty', N'Công ty TNHH Nấm Tươi Organic', N'Cao Thị Phương', N'Giám đốc', '0901000015', 'namtuoi@mail.com', N'Nhà cung cấp', '001099000015', N'43 Lạc Long Quân, Q.Tân Bình', N'Hoạt động'),
(N'SUP016', N'Công ty', N'Công ty CP Bao Bì Thực Phẩm', N'Tô Văn Quang', N'Giám đốc', '0901000016', 'baobitphm@mail.com', N'Nhà cung cấp', '001099000016', N'KCN Tân Bình, TP.HCM', N'Hoạt động'),
(N'SUP017', N'Công ty', N'Công ty TNHH Gas Petrolimex', N'Hà Thị Rạng', N'Phó GĐ', '0901000017', 'gaspetro@mail.com', N'Nhà cung cấp', '001099000017', N'55 Quang Trung, Gò Vấp', N'Hoạt động'),
(N'SUP018', N'Cá nhân', N'Lâm Văn Sơn - Trại heo sạch', N'Lâm Văn Sơn', N'Chủ trại', '0901000018', 'traiheo@mail.com', N'Nhà cung cấp', '001099000018', N'Xã Tân Uyên, Bình Dương', N'Ngừng hợp tác'),
(N'SUP019', N'Công ty', N'Công ty CP Đồ Uống Coca-Cola VN', N'Đặng Văn Tài', N'Giám đốc', '0901000019', 'cocacola@mail.com', N'Nhà cung cấp', '001099000019', N'77 Pasteur, Q.1, TP.HCM', N'Hoạt động'),
(N'SUP020', N'Công ty', N'Công ty TNHH Nội Thất Nhà Hàng Hưng Thịnh', N'Nguyễn Thị Uyên', N'Trưởng phòng', '0901000020', 'noithatnhahang@mail.com', N'Nhà cung cấp', '001099000020', N'32 Trường Chinh, Q.Tân Phú', N'Hoạt động'),
(N'SUP021', N'Công ty', N'Công ty CP Gạo Ngon Sóc Trăng', N'Trương Văn Vinh', N'Giám đốc', '0901000021', 'gaongon@mail.com', N'Nhà cung cấp', '001099000021', N'KCN Long Thành, Đồng Nai', N'Hoạt động'),
(N'SUP022', N'Công ty', N'Công ty TNHH Dụng Cụ Nhà Bếp ProChef', N'Lê Thị Xuyến', N'Phó GĐ', '0901000022', 'prochef@mail.com', N'Nhà cung cấp', '001099000022', N'18 Lý Tự Trọng, Q.1, TP.HCM', N'Hoạt động'),
(N'SUP023', N'Cá nhân', N'Phạm Quốc Yên - Trại vịt', N'Phạm Quốc Yên', N'Chủ trại', '0901000023', 'traivit@mail.com', N'Nhà cung cấp', '001099000023', N'Xã Hòa Phú, Long An', N'Ngừng hợp tác'),
(N'SUP024', N'Công ty', N'Công ty CP Đậu Hũ Sài Gòn', N'Hồ Văn Anh', N'Giám đốc', '0901000024', 'dauhusg@mail.com', N'Nhà cung cấp', '001099000024', N'120 An Dương Vương, Q.6, TP.HCM', N'Hoạt động'),
(N'SUP025', N'Công ty', N'Công ty TNHH Trà & Cà Phê Highlands', N'Nguyễn Thị Bảo', N'Trưởng phòng', '0901000025', 'highlands@mail.com', N'Nhà cung cấp', '001099000025', N'25 Nguyễn Thị Minh Khai, Q.1', N'Hoạt động'),
(N'SUP026', N'Công ty', N'Công ty TNHH Sữa Vinamilk', N'Lê Văn Cao', N'Giám đốc', '0901000026', 'vinamilk@mail.com', N'Nhà cung cấp', '001099000026', N'10 Tân Trào, Q.7, TP.HCM', N'Hoạt động'),
(N'SUP027', N'Công ty', N'Công ty CP Giấy & Vệ Sinh Sài Gòn', N'Trần Minh Đức', N'Phó GĐ', '0901000027', 'giaysg@mail.com', N'Nhà cung cấp', '001099000027', N'KCN Hiệp Phước, Nhà Bè', N'Hoạt động'),
(N'SUP028', N'Công ty', N'Công ty TNHH Hóa Chất Vệ Sinh F&B', N'Phan Thị Hoa', N'Giám đốc', '0901000028', 'hoachathvs@mail.com', N'Nhà cung cấp', '001099000028', N'56 Trường Sơn, Q.Tân Bình', N'Hoạt động'),
(N'SUP029', N'Công ty', N'Công ty CP Đá Viên Sài Gòn ICE', N'Nguyễn Hoàng Nam', N'Giám đốc', '0901000029', 'saigon.ice@mail.com', N'Nhà cung cấp', '001099000029', N'78 Lê Văn Việt, Q.9, TP.HCM', N'Hoạt động'),
(N'SUP030', N'Công ty', N'Công ty TNHH Tương Ớt Cholimex', N'Võ Thị Lan', N'Trưởng phòng', '0901000030', 'cholimex@mail.com', N'Nhà cung cấp', '001099000030', N'KCN Vĩnh Lộc, Bình Chánh', N'Hoạt động'),
(N'SUP031', N'Cá nhân', N'Trần Văn Bảy - Vựa hải sản Cần Giờ', N'Trần Văn Bảy', N'Chủ vựa', '0901000031', 'vuahscg@mail.com', N'Nhà cung cấp', '001099000031', N'Cần Giờ, TP.HCM', N'Hoạt động'),
(N'SUP032', N'Công ty', N'Công ty CP Mì & Nui Safoco', N'Lâm Thị Ngọc', N'Giám đốc', '0901000032', 'safoco@mail.com', N'Nhà cung cấp', '001099000032', N'KCN Tân Tạo, Q.Bình Tân', N'Hoạt động'),
(N'SUP033', N'Công ty', N'Công ty TNHH Thịt Bò Úc Nhập Khẩu', N'Đoàn Văn Khải', N'Giám đốc', '0901000033', 'beefaus@mail.com', N'Nhà cung cấp', '001099000033', N'Cảng Cát Lái, Q.2, TP.HCM', N'Hoạt động'),
(N'SUP034', N'Công ty', N'Công ty CP Rượu Vang Đà Lạt', N'Hoàng Minh Trí', N'Phó GĐ', '0901000034', 'ruoudalat@mail.com', N'Nhà cung cấp', '001099000034', N'Phường 2, TP. Đà Lạt', N'Hoạt động'),
(N'SUP035', N'Công ty', N'Công ty TNHH Trứng Sạch Ba Huân', N'Bà Ba Huân', N'Giám đốc', '0901000035', 'bahuan@mail.com', N'Nhà cung cấp', '001099000035', N'KCN Tân Hiệp, Hóc Môn', N'Hoạt động'),
(N'SUP036', N'Công ty', N'Công ty CP Than & Củi Nhà Hàng', N'Nguyễn Tấn Phát', N'Giám đốc', '0901000036', 'thancui@mail.com', N'Nhà cung cấp', '001099000036', N'Tân Uyên, Bình Dương', N'Hoạt động'),
(N'SUP037', N'Công ty', N'Công ty TNHH Chén Dĩa Minh Long', N'Lý Thị Hằng', N'Trưởng phòng', '0901000037', 'minhlong@mail.com', N'Nhà cung cấp', '001099000037', N'Bình Dương', N'Hoạt động'),
(N'SUP038', N'Công ty', N'Công ty CP Khăn & Tạp Dề Nhà Hàng', N'Trương Thị Mai', N'Giám đốc', '0901000038', 'khannhahang@mail.com', N'Nhà cung cấp', '001099000038', N'Q.Tân Phú, TP.HCM', N'Hoạt động'),
(N'SUP039', N'Công ty', N'Công ty TNHH Tôm Hùm Khánh Hòa', N'Nguyễn Văn Toàn', N'Giám đốc', '0901000039', 'tomhum@mail.com', N'Nhà cung cấp', '001099000039', N'Cam Ranh, Khánh Hòa', N'Hoạt động'),
(N'SUP040', N'Công ty', N'Công ty CP Đồ Nhựa Nhà Bếp', N'Phạm Thị Tuyết', N'Phó GĐ', '0901000040', 'donhuabep@mail.com', N'Nhà cung cấp', '001099000040', N'KCN Sóng Thần, Bình Dương', N'Hoạt động'),
(N'SUP041', N'Cá nhân', N'Lê Văn Tám - Nông trại rau organic', N'Lê Văn Tám', N'Chủ trại', '0901000041', 'rauorganic@mail.com', N'Nhà cung cấp', '001099000041', N'Củ Chi, TP.HCM', N'Hoạt động'),
(N'SUP042', N'Công ty', N'Công ty TNHH Hải Sản Đông Lạnh Á Châu', N'Vương Thị Diệu', N'Giám đốc', '0901000042', 'hsdlac@mail.com', N'Nhà cung cấp', '001099000042', N'Cảng cá Thị Vải, Bà Rịa', N'Hoạt động'),
(N'SUP043', N'Công ty', N'Công ty CP Máy Lạnh & Tủ Đông F&B', N'Huỳnh Văn Phong', N'Giám đốc', '0901000043', 'maylanhnhahang@mail.com', N'Nhà cung cấp', '001099000043', N'Q.Bình Thạnh, TP.HCM', N'Hoạt động'),
(N'SUP044', N'Công ty', N'Công ty TNHH In Ấn Menu & Marketing', N'Đặng Thị Vy', N'Giám đốc', '0901000044', 'inmenu@mail.com', N'Nhà cung cấp', '001099000044', N'Q.3, TP.HCM', N'Hoạt động'),
(N'SUP045', N'Công ty', N'Công ty CP Sa Tế & Gia Vị Lẩu', N'Trần Văn Hùng', N'Trưởng phòng', '0901000045', 'sategv@mail.com', N'Nhà cung cấp', '001099000045', N'Q.Tân Bình, TP.HCM', N'Hoạt động'),
(N'SUP046', N'Công ty', N'Công ty TNHH Nước Tương Maggi', N'Lê Hoàng Sơn', N'Giám đốc', '0901000046', 'maggi@mail.com', N'Nhà cung cấp', '001099000046', N'KCN VSIP, Bình Dương', N'Hoạt động'),
(N'SUP047', N'Công ty', N'Công ty CP Rau Mầm & Salad Fresh', N'Nguyễn Thị Hạnh', N'Giám đốc', '0901000047', 'saladfresh@mail.com', N'Nhà cung cấp', '001099000047', N'Lâm Đồng', N'Hoạt động'),
(N'SUP048', N'Công ty', N'Công ty TNHH Máy POS & Phần Mềm F&B', N'Võ Minh Quân', N'Giám đốc', '0901000048', 'posfnb@mail.com', N'Nhà cung cấp', '001099000048', N'Q.1, TP.HCM', N'Hoạt động'),
(N'SUP049', N'Công ty', N'Công ty CP Thủy Sản Minh Phú', N'Lê Văn Quang', N'Giám đốc', '0901000049', 'minhphu@mail.com', N'Nhà cung cấp', '001099000049', N'Cà Mau', N'Hoạt động'),
(N'SUP050', N'Công ty', N'Công ty TNHH Than Hoa BBQ', N'Phan Thị Em', N'Trưởng phòng', '0901000050', 'thanhoabbq@mail.com', N'Nhà cung cấp', '001099000050', N'Bình Phước', N'Hoạt động');
GO

/* =====================================================
   WAREHOUSE (5) - Kho nhà hàng / quán lẩu
===================================================== */
INSERT INTO Warehouse (code, name, typeId, address, area, managerName, managerPhone, status, note) VALUES
(N'WH001', N'Kho Lạnh - Thực Phẩm Tươi Sống', 1, N'Tầng hầm, 45 Nguyễn Huệ, Q.1, TP.HCM', 120.00, N'Nguyễn Văn Quản', '0911000001', N'Hoạt động', N'Kho lạnh chứa thịt, hải sản, rau củ tươi'),
(N'WH002', N'Kho Khô - Gia Vị & Nguyên Liệu Khô', 2, N'Lầu 1, 45 Nguyễn Huệ, Q.1, TP.HCM', 80.00, N'Trần Thị Lý', '0911000002', N'Hoạt động', N'Kho chứa gia vị, bún phở khô, đồ hộp'),
(N'WH003', N'Kho Đồ Uống & Nước Giải Khát', 2, N'Tầng hầm B2, 45 Nguyễn Huệ, Q.1, TP.HCM', 60.00, N'Lê Hoàng Nam', '0911000003', N'Hoạt động', N'Kho bia, nước ngọt, rượu vang'),
(N'WH004', N'Kho Vật Tư & Bao Bì', 3, N'28 Trần Hưng Đạo, Q.1, TP.HCM', 50.00, N'Phạm Minh Tuấn', '0911000004', N'Hoạt động', N'Kho khăn giấy, hộp xốp, bao bì đóng gói'),
(N'WH005', N'Kho Thiết Bị & Tài Sản', 3, N'Lầu 2, 45 Nguyễn Huệ, Q.1, TP.HCM', 40.00, N'Hoàng Thị Mai', '0911000005', N'Hoạt động', N'Kho chứa thiết bị dự phòng, bàn ghế phụ');
GO

/* =====================================================
   MATERIALS (100) - Quán ăn / Quán lẩu / Nhà hàng
   Nguyên liệu (40), Hàng hóa (35), Tài sản (25)
===================================================== */
INSERT INTO Materials (code, name, categoryId, unitId, supplierId, note, status, itemType) VALUES
-- === NGUYÊN LIỆU (40) - Thực phẩm tươi sống, gia vị, nguyên liệu nấu ===
(N'NL001', N'Thịt bò Úc thăn nội (Striploin)', 1, 1, 33, N'Đông lạnh -18°C', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL002', N'Thịt bò Mỹ Angus (Ribeye)', 1, 1, 33, N'Đông lạnh nhập khẩu', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL003', N'Ba chỉ bò Mỹ cuộn mỏng (lẩu)', 1, 1, 33, N'Cắt lát 2mm cho lẩu', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL004', N'Thịt heo ba rọi tươi', 1, 1, 2, N'Heo sạch VietGAP', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL005', N'Sườn heo non', 1, 1, 2, N'Tươi sống, giao mỗi sáng', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL006', N'Gà ta nguyên con', 1, 1, 8, N'Gà thả vườn 1.5-2kg', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL007', N'Cánh gà rán', 1, 1, 8, N'Đóng gói 1kg', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL008', N'Tôm sú loại 1 (20 con/kg)', 1, 1, 3, N'Tươi sống', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL009', N'Mực ống tươi', 1, 1, 3, N'Size trung 300-500g/con', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL010', N'Cá hồi fillet Na Uy', 1, 1, 42, N'Đông lạnh -20°C', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL011', N'Nghêu trắng', 1, 1, 13, N'Tươi sống kg', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL012', N'Bạch tuộc baby', 1, 1, 3, N'Làm sạch đông lạnh', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL013', N'Tôm hùm Alaska', 1, 1, 39, N'Đông lạnh nguyên con', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL014', N'Nấm kim châm Hàn Quốc', 2, 4, 15, N'Gói 150g', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL015', N'Nấm đùi gà tươi', 2, 1, 15, N'Organic', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL016', N'Nấm hương khô', 2, 1, 15, N'Gói 500g', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL017', N'Rau muống tươi', 2, 4, 4, N'Bó 500g', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL018', N'Cải thảo (cải thìa lẩu)', 2, 1, 4, N'Cây 1-1.5kg', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL019', N'Rau nhút (rau muống biển)', 2, 4, 41, N'Bó 300g', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL020', N'Bắp cải trắng', 2, 1, 4, N'Cây 1-2kg', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL021', N'Ngò gai, húng quế, tía tô', 2, 4, 41, N'Rau thơm tổng hợp', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL022', N'Đậu hũ non (lẩu)', 3, 4, 24, N'Hộp 400g', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL023', N'Đậu hũ chiên', 3, 4, 24, N'Miếng vuông túi 500g', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL024', N'Bún tươi', 3, 1, 10, N'Giao mỗi sáng', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL025', N'Phở tươi sợi to', 3, 1, 10, N'Giao mỗi sáng', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL026', N'Mì vàng tươi (mì trứng)', 3, 1, 32, N'Gói 500g', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL027', N'Gạo ST25 Sóc Trăng', 3, 1, 21, N'Bao 25kg', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL028', N'Sa tế lẩu Thái', 4, 4, 45, N'Hũ 500g', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL029', N'Nước mắm Phú Quốc 40 độ đạm', 4, 4, 9, N'Chai 1 lít', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL030', N'Tương ớt Cholimex', 4, 4, 30, N'Chai 750ml', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL031', N'Nước tương Maggi', 4, 4, 46, N'Chai 700ml', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL032', N'Dầu ăn Tường An', 4, 4, 11, N'Can 5 lít', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL033', N'Dầu hào Lee Kum Kee', 4, 4, 5, N'Chai 510g', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL034', N'Bột nêm Knorr', 4, 1, 5, N'Gói 1kg', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL035', N'Muối hạt biển', 4, 1, 5, N'Bao 25kg', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL036', N'Đường cát trắng', 4, 1, 5, N'Bao 50kg', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL037', N'Tiêu đen xay', 4, 1, 5, N'Gói 500g', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL038', N'Tỏi băm sẵn', 4, 4, 5, N'Hũ 1kg', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL039', N'Ớt tươi (chỉ thiên)', 2, 1, 4, N'Kg', N'Đang hoạt động', N'Nguyên liệu'),
(N'NL040', N'Trứng gà ta Ba Huân', 2, 10, 35, N'Khay 30 trứng', N'Đang hoạt động', N'Nguyên liệu'),
-- === HÀNG HÓA (35) - Đồ uống, bao bì, vật tư tiêu hao ===
(N'HH001', N'Bia Sài Gòn Special lon 330ml', 5, 10, 7, N'Thùng 24 lon', N'Đang hoạt động', N'Hàng hóa'),
(N'HH002', N'Bia Tiger lon 330ml', 5, 10, 7, N'Thùng 24 lon', N'Đang hoạt động', N'Hàng hóa'),
(N'HH003', N'Bia Heineken lon 330ml', 5, 10, 7, N'Thùng 24 lon', N'Đang hoạt động', N'Hàng hóa'),
(N'HH004', N'Coca-Cola lon 330ml', 5, 10, 19, N'Thùng 24 lon', N'Đang hoạt động', N'Hàng hóa'),
(N'HH005', N'Pepsi lon 330ml', 5, 10, 6, N'Thùng 24 lon', N'Đang hoạt động', N'Hàng hóa'),
(N'HH006', N'Nước suối Aquafina 500ml', 5, 10, 19, N'Thùng 24 chai', N'Đang hoạt động', N'Hàng hóa'),
(N'HH007', N'7Up lon 330ml', 5, 10, 6, N'Thùng 24 lon', N'Đang hoạt động', N'Hàng hóa'),
(N'HH008', N'Nước cam ép Twister', 5, 10, 6, N'Thùng 24 chai', N'Đang hoạt động', N'Hàng hóa'),
(N'HH009', N'Rượu vang đỏ Đà Lạt', 5, 2, 34, N'Chai 750ml', N'Đang hoạt động', N'Hàng hóa'),
(N'HH010', N'Rượu Soju Hàn Quốc', 5, 2, 6, N'Chai 360ml', N'Đang hoạt động', N'Hàng hóa'),
(N'HH011', N'Trà đá túi lọc Lipton', 5, 4, 25, N'Hộp 100 gói', N'Đang hoạt động', N'Hàng hóa'),
(N'HH012', N'Sữa đặc Ông Thọ', 5, 4, 26, N'Lon 380g', N'Đang hoạt động', N'Hàng hóa'),
(N'HH013', N'Đá viên tinh khiết', 5, 1, 29, N'Bao 10kg', N'Đang hoạt động', N'Hàng hóa'),
(N'HH014', N'Khăn giấy ăn (napkin)', 6, 4, 27, N'Thùng 30 gói x 100 tờ', N'Đang hoạt động', N'Hàng hóa'),
(N'HH015', N'Khăn ướt lau tay', 6, 4, 27, N'Thùng 50 gói x 10 tờ', N'Đang hoạt động', N'Hàng hóa'),
(N'HH016', N'Hộp xốp đựng thức ăn mang về', 6, 4, 16, N'Thùng 200 hộp', N'Đang hoạt động', N'Hàng hóa'),
(N'HH017', N'Túi nilon đựng đồ ăn', 6, 4, 16, N'Kg', N'Đang hoạt động', N'Hàng hóa'),
(N'HH018', N'Màng bọc thực phẩm', 6, 2, 16, N'Cuộn 30cm x 300m', N'Đang hoạt động', N'Hàng hóa'),
(N'HH019', N'Giấy bạc nhôm', 6, 2, 16, N'Cuộn 30cm x 150m', N'Đang hoạt động', N'Hàng hóa'),
(N'HH020', N'Găng tay nilon dùng 1 lần', 6, 4, 16, N'Hộp 100 cái', N'Đang hoạt động', N'Hàng hóa'),
(N'HH021', N'Tạp dề nhân viên bếp', 6, 2, 38, N'Vải chống thấm', N'Đang hoạt động', N'Hàng hóa'),
(N'HH022', N'Nước rửa chén Sunlight', 7, 2, 28, N'Can 4 lít', N'Đang hoạt động', N'Hàng hóa'),
(N'HH023', N'Nước lau sàn nhà hàng', 7, 2, 28, N'Can 4 lít', N'Đang hoạt động', N'Hàng hóa'),
(N'HH024', N'Nước tẩy rửa bếp công nghiệp', 7, 2, 28, N'Can 5 lít', N'Đang hoạt động', N'Hàng hóa'),
(N'HH025', N'Than hoa nướng BBQ', 7, 1, 50, N'Bao 10kg', N'Đang hoạt động', N'Hàng hóa'),
(N'HH026', N'Gas bình 12kg (Petrolimex)', 7, 2, 17, N'Bình 12kg', N'Đang hoạt động', N'Hàng hóa'),
(N'HH027', N'Bình gas mini du lịch', 7, 2, 17, N'Lon 220g', N'Đang hoạt động', N'Hàng hóa'),
(N'HH028', N'Đũa dùng 1 lần (tre)', 6, 4, 16, N'Bó 100 đôi', N'Đang hoạt động', N'Hàng hóa'),
(N'HH029', N'Ly nhựa nắp dome 500ml', 6, 4, 40, N'Thùng 500 ly', N'Đang hoạt động', N'Hàng hóa'),
(N'HH030', N'Ống hút giấy', 6, 4, 16, N'Hộp 250 ống', N'Đang hoạt động', N'Hàng hóa'),
(N'HH031', N'Giấy in bill nhiệt K80', 6, 2, 27, N'Cuộn 80mm', N'Đang hoạt động', N'Hàng hóa'),
(N'HH032', N'Nến trang trí bàn ăn', 6, 4, 20, N'Hộp 12 cây', N'Đang hoạt động', N'Hàng hóa'),
(N'HH033', N'Tăm tre vệ sinh', 6, 4, 16, N'Hộp 200 cây', N'Đang hoạt động', N'Hàng hóa'),
(N'HH034', N'Bình xịt diệt côn trùng', 7, 2, 28, N'Chai 600ml', N'Đang hoạt động', N'Hàng hóa'),
(N'HH035', N'Nước rửa tay diệt khuẩn', 7, 2, 28, N'Chai 500ml', N'Đang hoạt động', N'Hàng hóa'),
-- === TÀI SẢN (25) - Thiết bị bếp, nội thất, máy móc nhà hàng ===
(N'TS001', N'Bếp gas công nghiệp 2 họng', 8, 2, 12, N'Công suất lớn inox 304', N'Đang hoạt động', N'Tài sản'),
(N'TS002', N'Bếp gas công nghiệp 1 họng áp suất cao', 8, 2, 12, N'Dùng cho nấu nước lẩu', N'Đang hoạt động', N'Tài sản'),
(N'TS003', N'Tủ đông đứng 500L Sanaky', 8, 2, 43, N'Đông lạnh -24°C', N'Đang hoạt động', N'Tài sản'),
(N'TS004', N'Tủ mát trưng bày nước 2 cánh', 8, 2, 43, N'400L kính cường lực', N'Đang hoạt động', N'Tài sản'),
(N'TS005', N'Tủ lạnh công nghiệp 4 cánh inox', 8, 2, 43, N'1000L bếp nhà hàng', N'Đang hoạt động', N'Tài sản'),
(N'TS006', N'Máy xay thịt công nghiệp', 8, 2, 12, N'Công suất 200kg/h', N'Đang hoạt động', N'Tài sản'),
(N'TS007', N'Máy cắt thịt lát mỏng (lẩu)', 8, 2, 12, N'Lát 1-3mm tự động', N'Đang hoạt động', N'Tài sản'),
(N'TS008', N'Nồi lẩu inox 2 ngăn (yin-yang)', 8, 2, 22, N'Đường kính 32cm', N'Đang hoạt động', N'Tài sản'),
(N'TS009', N'Bếp từ âm bàn cho lẩu', 8, 2, 12, N'Công suất 2000W', N'Đang hoạt động', N'Tài sản'),
(N'TS010', N'Máy rửa chén công nghiệp', 8, 2, 12, N'Rửa 60 rổ/giờ', N'Đang hoạt động', N'Tài sản'),
(N'TS011', N'Hệ thống hút mùi bếp công nghiệp', 8, 2, 12, N'Inox SUS304', N'Đang hoạt động', N'Tài sản'),
(N'TS012', N'Bàn ăn gỗ 4 người', 9, 2, 20, N'Gỗ cao su phủ sơn PU', N'Đang hoạt động', N'Tài sản'),
(N'TS013', N'Bàn ăn gỗ 6 người có bếp lẩu', 9, 2, 20, N'Khoét lỗ giữa cho bếp', N'Đang hoạt động', N'Tài sản'),
(N'TS014', N'Ghế ăn gỗ bọc nệm', 9, 2, 20, N'Đệm simili dễ lau', N'Đang hoạt động', N'Tài sản'),
(N'TS015', N'Máy POS tính tiền cảm ứng', 8, 2, 48, N'Màn hình 15 inch', N'Đang hoạt động', N'Tài sản'),
(N'TS016', N'Máy in bill nhiệt Epson', 8, 2, 48, N'Khổ 80mm', N'Đang hoạt động', N'Tài sản'),
(N'TS017', N'Hệ thống camera an ninh 8 mắt', 8, 2, 48, N'Full HD ghi 30 ngày', N'Đang hoạt động', N'Tài sản'),
(N'TS018', N'Máy lạnh treo tường 2HP', 8, 2, 43, N'Inverter tiết kiệm điện', N'Đang hoạt động', N'Tài sản'),
(N'TS019', N'Quầy bar pha chế inox', 8, 2, 12, N'Dài 2.5m có bồn rửa', N'Đang hoạt động', N'Tài sản'),
(N'TS020', N'Tủ giữ nóng thức ăn', 8, 2, 12, N'Kính cường lực 2 tầng', N'Đang hoạt động', N'Tài sản'),
(N'TS021', N'Máy ép trái cây công nghiệp', 8, 2, 22, N'Inox 304 công suất lớn', N'Đang hoạt động', N'Tài sản'),
(N'TS022', N'Nồi nấu phở / hầm xương 100L', 8, 2, 12, N'Inox SUS304 dày 1.2mm', N'Đang hoạt động', N'Tài sản'),
(N'TS023', N'Xe đẩy phục vụ 3 tầng inox', 8, 2, 22, N'Tải trọng 100kg', N'Đang hoạt động', N'Tài sản'),
(N'TS024', N'Máy làm đá viên 100kg/ngày', 8, 2, 43, N'Tự động', N'Đang hoạt động', N'Tài sản'),
(N'TS025', N'Bảng hiệu LED nhà hàng ngoài trời', 8, 2, 44, N'Kích thước 3m x 1m', N'Đang hoạt động', N'Tài sản');
GO

/* =====================================================
   IMPORT RECEIPTS (40) - 4 statuses:
   Đã xác nhận (15), Chờ xác nhận (10), Đang soạn thảo (10), Đã hủy (5)
===================================================== */
INSERT INTO ImportReceipt (code, receiptNumber, importTime, supplierId, warehouseId, supplierInvoiceNo, documentNo, totalAmount, status, createdBy, approvedBy, approvedAt, note, createdAt) VALUES
(N'PN001', N'PN-2025-001', '2025-01-05 06:30:00', 2, 1, N'HD-SF-001', N'CT-001', 37600000, N'Đã xác nhận', N'Nguyễn Văn An', N'Trần Thị Bình', '2025-01-05 08:00:00', N'Nhập thịt heo tươi đầu tuần', '2025-01-05 06:30:00'),
(N'PN002', N'PN-2025-002', '2025-01-05 07:00:00', 3, 1, N'HD-BD-001', N'CT-002', 38000000, N'Đã xác nhận', N'Nguyễn Văn An', N'Trần Thị Bình', '2025-01-05 08:00:00', N'Nhập hải sản tươi sống', '2025-01-05 07:00:00'),
(N'PN003', N'PN-2025-003', '2025-01-06 06:00:00', 4, 1, N'HD-DL-001', N'CT-003', 8470000, N'Đã xác nhận', N'Lê Hoàng Nam', N'Trần Thị Bình', '2025-01-06 08:00:00', N'Nhập rau củ tươi Đà Lạt', '2025-01-06 06:00:00'),
(N'PN004', N'PN-2025-004', '2025-01-07 08:00:00', 7, 3, N'HD-BSG-001', N'CT-004', 42810000, N'Đã xác nhận', N'Lê Hoàng Nam', N'Nguyễn Văn An', '2025-01-07 10:00:00', N'Nhập bia các loại', '2025-01-07 08:00:00'),
(N'PN005', N'PN-2025-005', '2025-01-08 09:00:00', 5, 2, N'HD-GV-001', N'CT-005', 11525000, N'Đã xác nhận', N'Trần Thị Lý', N'Nguyễn Văn An', '2025-01-08 10:30:00', N'Nhập gia vị nấu ăn', '2025-01-08 09:00:00'),
(N'PN006', N'PN-2025-006', '2025-01-10 06:30:00', 33, 1, N'HD-BU-001', N'CT-006', 67200000, N'Đã xác nhận', N'Nguyễn Văn An', N'Trần Thị Bình', '2025-01-10 08:00:00', N'Nhập thịt bò Úc/Mỹ nhập khẩu', '2025-01-10 06:30:00'),
(N'PN007', N'PN-2025-007', '2025-01-12 07:30:00', 15, 1, N'HD-NAM-001', N'CT-007', 5800000, N'Đã xác nhận', N'Lê Hoàng Nam', N'Trần Thị Bình', '2025-01-12 09:00:00', N'Nhập nấm các loại', '2025-01-12 07:30:00'),
(N'PN008', N'PN-2025-008', '2025-01-13 08:00:00', 10, 2, N'HD-BPT-001', N'CT-008', 7240000, N'Đã xác nhận', N'Trần Thị Lý', N'Nguyễn Văn An', '2025-01-13 10:00:00', N'Nhập bún phở tươi', '2025-01-13 08:00:00'),
(N'PN009', N'PN-2025-009', '2025-01-15 09:00:00', 12, 5, N'HD-TBB-001', N'CT-009', 185000000, N'Đã xác nhận', N'Phạm Minh Tuấn', N'Nguyễn Văn An', '2025-01-16 08:00:00', N'Nhập thiết bị bếp công nghiệp', '2025-01-15 09:00:00'),
(N'PN010', N'PN-2025-010', '2025-01-18 08:00:00', 19, 3, N'HD-CC-001', N'CT-010', 18590000, N'Đã xác nhận', N'Lê Hoàng Nam', N'Trần Thị Bình', '2025-01-18 10:00:00', N'Nhập nước ngọt Coca-Cola', '2025-01-18 08:00:00'),
(N'PN011', N'PN-2025-011', '2025-01-20 07:00:00', 16, 4, N'HD-BB-001', N'CT-011', 9205000, N'Đã xác nhận', N'Phạm Minh Tuấn', N'Trần Thị Bình', '2025-01-20 09:00:00', N'Nhập bao bì đóng gói', '2025-01-20 07:00:00'),
(N'PN012', N'PN-2025-012', '2025-01-22 06:30:00', 35, 1, N'HD-BH-001', N'CT-012', 4795000, N'Đã xác nhận', N'Nguyễn Văn An', N'Trần Thị Bình', '2025-01-22 08:00:00', N'Nhập trứng gà sạch', '2025-01-22 06:30:00'),
(N'PN013', N'PN-2025-013', '2025-01-25 08:00:00', 20, 5, N'HD-NT-001', N'CT-013', 95000000, N'Đã xác nhận', N'Phạm Minh Tuấn', N'Nguyễn Văn An', '2025-01-26 08:00:00', N'Nhập bàn ghế nhà hàng', '2025-01-25 08:00:00'),
(N'PN014', N'PN-2025-014', '2025-01-28 09:00:00', 28, 4, N'HD-HVS-001', N'CT-014', 6535000, N'Đã xác nhận', N'Phạm Minh Tuấn', N'Trần Thị Bình', '2025-01-28 10:00:00', N'Nhập hóa chất vệ sinh', '2025-01-28 09:00:00'),
(N'PN015', N'PN-2025-015', '2025-02-01 08:00:00', 17, 4, N'HD-GAS-001', N'CT-015', 7200000, N'Đã xác nhận', N'Phạm Minh Tuấn', N'Nguyễn Văn An', '2025-02-01 09:00:00', N'Nhập gas bình', '2025-02-01 08:00:00'),
(N'PN016', N'PN-2025-016', '2025-02-03 06:30:00', 2, 1, N'HD-SF-002', N'CT-016', 32450000, N'Chờ xác nhận', N'Nguyễn Văn An', NULL, NULL, N'Nhập thịt heo tuần 2/2', '2025-02-03 06:30:00'),
(N'PN017', N'PN-2025-017', '2025-02-03 07:00:00', 3, 1, N'HD-BD-002', N'CT-017', 40900000, N'Chờ xác nhận', N'Nguyễn Văn An', NULL, NULL, N'Nhập hải sản tuần 2/2', '2025-02-03 07:00:00'),
(N'PN018', N'PN-2025-018', '2025-02-05 08:00:00', 45, 2, N'HD-ST-001', N'CT-018', 8905000, N'Chờ xác nhận', N'Trần Thị Lý', NULL, NULL, N'Nhập sa tế và gia vị lẩu', '2025-02-05 08:00:00'),
(N'PN019', N'PN-2025-019', '2025-02-06 07:00:00', 4, 1, N'HD-DL-002', N'CT-019', 7315000, N'Chờ xác nhận', N'Lê Hoàng Nam', NULL, NULL, N'Nhập rau củ Đà Lạt tuần 2', '2025-02-06 07:00:00'),
(N'PN020', N'PN-2025-020', '2025-02-07 09:00:00', 6, 3, N'HD-NGK-001', N'CT-020', 28350000, N'Chờ xác nhận', N'Lê Hoàng Nam', NULL, NULL, N'Nhập nước giải khát tổng hợp', '2025-02-07 09:00:00'),
(N'PN021', N'PN-2025-021', '2025-02-08 06:00:00', 42, 1, N'HD-HSDL-001', N'CT-021', 51400000, N'Chờ xác nhận', N'Nguyễn Văn An', NULL, NULL, N'Nhập hải sản đông lạnh cao cấp', '2025-02-08 06:00:00'),
(N'PN022', N'PN-2025-022', '2025-02-10 08:00:00', 21, 2, N'HD-GAO-001', N'CT-022', 5600000, N'Chờ xác nhận', N'Trần Thị Lý', NULL, NULL, N'Nhập gạo ST25', '2025-02-10 08:00:00'),
(N'PN023', N'PN-2025-023', '2025-02-11 07:00:00', 24, 1, N'HD-DH-001', N'CT-023', 3320000, N'Chờ xác nhận', N'Lê Hoàng Nam', NULL, NULL, N'Nhập đậu hũ các loại', '2025-02-11 07:00:00'),
(N'PN024', N'PN-2025-024', '2025-02-12 08:00:00', 43, 5, N'HD-ML-001', N'CT-024', 45500000, N'Chờ xác nhận', N'Phạm Minh Tuấn', NULL, NULL, N'Nhập tủ đông & máy lạnh', '2025-02-12 08:00:00'),
(N'PN025', N'PN-2025-025', '2025-02-13 09:00:00', 27, 4, N'HD-GVS-001', N'CT-025', 4230000, N'Chờ xác nhận', N'Phạm Minh Tuấn', NULL, NULL, N'Nhập giấy & khăn vệ sinh', '2025-02-13 09:00:00'),
(N'PN026', N'PN-2025-026', '2025-02-15 06:30:00', 33, 1, NULL, NULL, 82800000, N'Đang soạn thảo', N'Nguyễn Văn An', NULL, NULL, N'Nhập thịt bò Úc lô mới', '2025-02-15 06:30:00'),
(N'PN027', N'PN-2025-027', '2025-02-16 07:00:00', 39, 1, NULL, NULL, 124800000, N'Đang soạn thảo', N'Nguyễn Văn An', NULL, NULL, N'Nhập tôm hùm cho event', '2025-02-16 07:00:00'),
(N'PN028', N'PN-2025-028', '2025-02-17 08:00:00', 49, 1, NULL, NULL, 55600000, N'Đang soạn thảo', N'Lê Hoàng Nam', NULL, NULL, N'Nhập tôm sú cỡ lớn', '2025-02-17 08:00:00'),
(N'PN029', N'PN-2025-029', '2025-02-18 09:00:00', 7, 3, NULL, NULL, 61000000, N'Đang soạn thảo', N'Lê Hoàng Nam', NULL, NULL, N'Nhập bia Tết đợt 2', '2025-02-18 09:00:00'),
(N'PN030', N'PN-2025-030', '2025-02-19 08:00:00', 34, 3, NULL, NULL, 13900000, N'Đang soạn thảo', N'Lê Hoàng Nam', NULL, NULL, N'Nhập rượu vang cho menu mới', '2025-02-19 08:00:00'),
(N'PN031', N'PN-2025-031', '2025-02-20 07:00:00', 50, 2, NULL, NULL, 5650000, N'Đang soạn thảo', N'Trần Thị Lý', NULL, NULL, N'Nhập than hoa BBQ', '2025-02-20 07:00:00'),
(N'PN032', N'PN-2025-032', '2025-02-21 08:00:00', 22, 5, NULL, NULL, 33500000, N'Đang soạn thảo', N'Phạm Minh Tuấn', NULL, NULL, N'Nhập dụng cụ bếp ProChef', '2025-02-21 08:00:00'),
(N'PN033', N'PN-2025-033', '2025-02-22 09:00:00', 48, 5, NULL, NULL, 40500000, N'Đang soạn thảo', N'Phạm Minh Tuấn', NULL, NULL, N'Nhập máy POS mới', '2025-02-22 09:00:00'),
(N'PN034', N'PN-2025-034', '2025-02-23 06:00:00', 8, 1, NULL, NULL, 14550000, N'Đang soạn thảo', N'Nguyễn Văn An', NULL, NULL, N'Nhập gà ta nguyên con', '2025-02-23 06:00:00'),
(N'PN035', N'PN-2025-035', '2025-02-24 07:00:00', 41, 1, NULL, NULL, 3860000, N'Đang soạn thảo', N'Lê Hoàng Nam', NULL, NULL, N'Nhập rau organic', '2025-02-24 07:00:00'),
(N'PN036', N'PN-2025-036', '2025-01-10 06:00:00', 13, 1, N'HD-VTC-001', N'CT-036', 25450000, N'Đã hủy', N'Nguyễn Văn An', NULL, NULL, N'Hủy - hải sản không đạt chất lượng', '2025-01-10 06:00:00'),
(N'PN037', N'PN-2025-037', '2025-01-15 07:00:00', 18, 1, N'HD-HS-001', N'CT-037', 19300000, N'Đã hủy', N'Nguyễn Văn An', NULL, NULL, N'Hủy - trại heo đóng cửa kiểm dịch', '2025-01-15 07:00:00'),
(N'PN038', N'PN-2025-038', '2025-01-20 08:00:00', 23, 1, N'HD-VIT-001', N'CT-038', 6600000, N'Đã hủy', N'Lê Hoàng Nam', NULL, NULL, N'Hủy - NCC ngừng hợp tác', '2025-01-20 08:00:00'),
(N'PN039', N'PN-2025-039', '2025-01-25 09:00:00', 43, 5, N'HD-ML-002', N'CT-039', 60000000, N'Đã hủy', N'Phạm Minh Tuấn', NULL, NULL, N'Hủy - thay đổi model thiết bị', '2025-01-25 09:00:00'),
(N'PN040', N'PN-2025-040', '2025-02-01 07:00:00', 42, 1, N'HD-HSDL-002', N'CT-040', 33600000, N'Đã hủy', N'Nguyễn Văn An', NULL, NULL, N'Hủy - trùng với PN021', '2025-02-01 07:00:00');
GO

/* =====================================================
   IMPORT RECEIPT DETAILS (~120 lines for 40 receipts)
===================================================== */
INSERT INTO ImportReceiptDetail (importReceiptId, materialId, unitId, quantity, unitPrice, amount, note) VALUES
-- PN001: Nhập thịt heo tươi (Đã xác nhận)
(1, 4, 1, 100, 125000, 12500000, N'Thịt heo ba rọi tươi'),
(1, 5, 1, 80, 155000, 12400000, N'Sườn heo non'),
(1, 6, 1, 50, 185000, 9250000, N'Gà ta nguyên con'),
(1, 7, 1, 30, 115000, 3450000, N'Cánh gà rán'),
-- PN002: Nhập hải sản tươi (Đã xác nhận)
(2, 8, 1, 50, 320000, 16000000, N'Tôm sú loại 1'),
(2, 9, 1, 30, 280000, 8400000, N'Mực ống tươi'),
(2, 11, 1, 40, 85000, 3400000, N'Nghêu trắng'),
(2, 12, 1, 20, 250000, 5000000, N'Bạch tuộc baby'),
(2, 10, 1, 10, 520000, 5200000, N'Cá hồi fillet Na Uy'),
-- PN003: Nhập rau củ Đà Lạt (Đã xác nhận)
(3, 17, 4, 50, 15000, 750000, N'Rau muống tươi bó'),
(3, 18, 1, 40, 35000, 1400000, N'Cải thảo lẩu'),
(3, 20, 1, 30, 25000, 750000, N'Bắp cải trắng'),
(3, 39, 1, 10, 55000, 550000, N'Ớt tươi chỉ thiên'),
(3, 21, 4, 100, 8000, 800000, N'Rau thơm tổng hợp'),
(3, 19, 4, 60, 12000, 720000, N'Rau nhút'),
(3, 14, 4, 100, 18000, 1800000, N'Nấm kim châm'),
(3, 15, 1, 20, 85000, 1700000, N'Nấm đùi gà'),
-- PN004: Nhập bia (Đã xác nhận)
(4, 41, 10, 50, 285000, 14250000, N'Bia Sài Gòn Special thùng'),
(4, 42, 10, 40, 320000, 12800000, N'Bia Tiger thùng'),
(4, 43, 10, 30, 380000, 11400000, N'Bia Heineken thùng'),
(4, 50, 10, 20, 218000, 4360000, N'Rượu Soju thùng'),
-- PN005: Nhập gia vị (Đã xác nhận)
(5, 28, 4, 30, 65000, 1950000, N'Sa tế lẩu Thái'),
(5, 29, 4, 50, 45000, 2250000, N'Nước mắm Phú Quốc'),
(5, 30, 4, 40, 35000, 1400000, N'Tương ớt Cholimex'),
(5, 31, 4, 30, 28000, 840000, N'Nước tương Maggi'),
(5, 32, 4, 20, 125000, 2500000, N'Dầu ăn Tường An 5L'),
(5, 33, 4, 30, 42000, 1260000, N'Dầu hào Lee Kum Kee'),
(5, 34, 1, 10, 85000, 850000, N'Bột nêm Knorr 1kg'),
(5, 37, 1, 5, 95000, 475000, N'Tiêu đen xay 500g'),
-- PN006: Nhập thịt bò Úc/Mỹ (Đã xác nhận)
(6, 1, 1, 50, 520000, 26000000, N'Thịt bò Úc Striploin'),
(6, 2, 1, 30, 680000, 20400000, N'Thịt bò Mỹ Ribeye'),
(6, 3, 1, 40, 520000, 20800000, N'Ba chỉ bò cuộn lẩu'),
-- PN007: Nhập nấm (Đã xác nhận)
(7, 14, 4, 150, 18000, 2700000, N'Nấm kim châm gói 150g'),
(7, 15, 1, 20, 85000, 1700000, N'Nấm đùi gà tươi'),
(7, 16, 1, 10, 140000, 1400000, N'Nấm hương khô 500g'),
-- PN008: Nhập bún phở (Đã xác nhận)
(8, 24, 1, 100, 25000, 2500000, N'Bún tươi'),
(8, 25, 1, 80, 28000, 2240000, N'Phở tươi sợi to'),
(8, 26, 1, 50, 22000, 1100000, N'Mì vàng tươi 500g'),
(8, 27, 1, 5, 280000, 1400000, N'Gạo ST25 bao 25kg'),
-- PN009: Nhập thiết bị bếp (Đã xác nhận)
(9, 76, 2, 2, 8500000, 17000000, N'Bếp gas công nghiệp 2 họng'),
(9, 78, 2, 2, 18000000, 36000000, N'Tủ đông đứng 500L'),
(9, 80, 2, 1, 25000000, 25000000, N'Tủ lạnh CN 4 cánh inox'),
(9, 81, 2, 1, 15000000, 15000000, N'Máy xay thịt công nghiệp'),
(9, 82, 2, 1, 35000000, 35000000, N'Máy cắt thịt lát mỏng'),
(9, 85, 2, 1, 45000000, 45000000, N'Máy rửa chén công nghiệp'),
(9, 86, 2, 1, 12000000, 12000000, N'Hệ thống hút mùi'),
-- PN010: Nhập nước ngọt (Đã xác nhận)
(10, 44, 10, 30, 195000, 5850000, N'Coca-Cola thùng 24 lon'),
(10, 45, 10, 20, 185000, 3700000, N'Pepsi thùng'),
(10, 46, 10, 20, 72000, 1440000, N'Nước suối Aquafina thùng'),
(10, 47, 10, 15, 195000, 2925000, N'7Up thùng'),
(10, 48, 10, 15, 185000, 2775000, N'Nước cam Twister thùng'),
(10, 53, 1, 20, 95000, 1900000, N'Đá viên bao 10kg'),
-- PN011: Nhập bao bì (Đã xác nhận)
(11, 56, 4, 10, 285000, 2850000, N'Hộp xốp thùng 200'),
(11, 57, 1, 20, 45000, 900000, N'Túi nilon đựng đồ ăn'),
(11, 58, 2, 5, 185000, 925000, N'Màng bọc thực phẩm'),
(11, 60, 4, 20, 65000, 1300000, N'Găng tay nilon hộp'),
(11, 68, 4, 15, 35000, 525000, N'Đũa dùng 1 lần bó 100'),
(11, 54, 4, 15, 95000, 1425000, N'Khăn giấy ăn thùng'),
(11, 55, 4, 10, 128000, 1280000, N'Khăn ướt lau tay thùng'),
-- PN012: Nhập trứng (Đã xác nhận)
(12, 40, 10, 20, 105000, 2100000, N'Trứng gà ta khay 30'),
(12, 22, 4, 40, 32000, 1280000, N'Đậu hũ non hộp'),
(12, 23, 4, 30, 28000, 840000, N'Đậu hũ chiên túi'),
(12, 38, 4, 5, 115000, 575000, N'Tỏi băm hũ 1kg'),
-- PN013: Nhập bàn ghế (Đã xác nhận)
(13, 87, 2, 10, 3500000, 35000000, N'Bàn ăn gỗ 4 người'),
(13, 88, 2, 5, 5500000, 27500000, N'Bàn 6 người có bếp lẩu'),
(13, 89, 2, 50, 650000, 32500000, N'Ghế ăn bọc nệm'),
-- PN014: Nhập hóa chất vệ sinh (Đã xác nhận)
(14, 62, 2, 20, 85000, 1700000, N'Nước rửa chén Sunlight 4L'),
(14, 63, 2, 15, 75000, 1125000, N'Nước lau sàn 4L'),
(14, 64, 2, 10, 125000, 1250000, N'Nước tẩy bếp CN 5L'),
(14, 74, 2, 20, 45000, 900000, N'Bình xịt côn trùng'),
(14, 75, 2, 30, 52000, 1560000, N'Nước rửa tay diệt khuẩn'),
-- PN015: Nhập gas (Đã xác nhận)
(15, 66, 2, 15, 420000, 6300000, N'Gas bình 12kg'),
(15, 67, 2, 20, 45000, 900000, N'Bình gas mini du lịch'),
-- PN016: Nhập thịt heo tuần 2 (Chờ xác nhận)
(16, 4, 1, 80, 125000, 10000000, N'Ba rọi tươi'),
(16, 5, 1, 60, 155000, 9300000, N'Sườn heo non'),
(16, 6, 1, 40, 185000, 7400000, N'Gà ta nguyên con'),
(16, 7, 1, 50, 115000, 5750000, N'Cánh gà rán'),
-- PN017: Nhập hải sản tuần 2 (Chờ xác nhận)
(17, 8, 1, 60, 320000, 19200000, N'Tôm sú loại 1'),
(17, 9, 1, 40, 280000, 11200000, N'Mực ống tươi'),
(17, 11, 1, 50, 85000, 4250000, N'Nghêu trắng'),
(17, 12, 1, 25, 250000, 6250000, N'Bạch tuộc baby'),
-- PN018: Nhập sa tế gia vị lẩu (Chờ xác nhận)
(18, 28, 4, 50, 65000, 3250000, N'Sa tế lẩu Thái'),
(18, 30, 4, 50, 35000, 1750000, N'Tương ớt Cholimex'),
(18, 33, 4, 40, 42000, 1680000, N'Dầu hào'),
(18, 34, 1, 15, 85000, 1275000, N'Bột nêm Knorr'),
(18, 38, 4, 10, 95000, 950000, N'Tỏi băm hũ 1kg'),
-- PN019: Nhập rau Đà Lạt tuần 2 (Chờ xác nhận)
(19, 17, 4, 60, 15000, 900000, N'Rau muống bó'),
(19, 18, 1, 50, 35000, 1750000, N'Cải thảo'),
(19, 20, 1, 40, 25000, 1000000, N'Bắp cải'),
(19, 21, 4, 100, 8000, 800000, N'Rau thơm'),
(19, 14, 4, 80, 18000, 1440000, N'Nấm kim châm'),
(19, 39, 1, 15, 55000, 825000, N'Ớt tươi'),
(19, 19, 4, 50, 12000, 600000, N'Rau nhút'),
-- PN020: Nhập nước giải khát (Chờ xác nhận)
(20, 44, 10, 40, 195000, 7800000, N'Coca-Cola'),
(20, 45, 10, 30, 185000, 5550000, N'Pepsi'),
(20, 46, 10, 50, 72000, 3600000, N'Nước suối Aquafina'),
(20, 47, 10, 20, 195000, 3900000, N'7Up'),
(20, 48, 10, 20, 185000, 3700000, N'Nước cam Twister'),
(20, 53, 1, 40, 95000, 3800000, N'Đá viên'),
-- PN021: Nhập hải sản đông lạnh cao cấp (Chờ xác nhận)
(21, 10, 1, 30, 520000, 15600000, N'Cá hồi Na Uy'),
(21, 13, 1, 10, 1800000, 18000000, N'Tôm hùm Alaska'),
(21, 8, 1, 40, 320000, 12800000, N'Tôm sú size lớn'),
(21, 12, 1, 20, 250000, 5000000, N'Bạch tuộc baby'),
-- PN022: Nhập gạo (Chờ xác nhận)
(22, 27, 1, 20, 280000, 5600000, N'Gạo ST25 bao 25kg'),
-- PN023: Nhập đậu hũ (Chờ xác nhận)
(23, 22, 4, 60, 32000, 1920000, N'Đậu hũ non hộp'),
(23, 23, 4, 50, 28000, 1400000, N'Đậu hũ chiên túi'),
-- PN024: Nhập tủ đông & máy lạnh (Chờ xác nhận)
(24, 78, 2, 1, 18000000, 18000000, N'Tủ đông 500L'),
(24, 93, 2, 2, 12000000, 24000000, N'Máy lạnh 2HP'),
(24, 99, 2, 1, 3500000, 3500000, N'Máy làm đá 100kg/ngày'),
-- PN025: Nhập giấy khăn (Chờ xác nhận)
(25, 54, 4, 20, 95000, 1900000, N'Khăn giấy ăn thùng'),
(25, 55, 4, 10, 128000, 1280000, N'Khăn ướt thùng'),
(25, 71, 2, 10, 105000, 1050000, N'Giấy in bill K80'),
-- PN026: Nhập bò Úc lô mới (Đang soạn thảo)
(26, 1, 1, 80, 520000, 41600000, N'Striploin'),
(26, 2, 1, 30, 680000, 20400000, N'Ribeye'),
(26, 3, 1, 40, 520000, 20800000, N'Ba chỉ bò cuộn'),
-- PN027: Nhập tôm hùm event (Đang soạn thảo)
(27, 13, 1, 50, 1800000, 90000000, N'Tôm hùm Alaska'),
(27, 10, 1, 30, 520000, 15600000, N'Cá hồi fillet'),
(27, 8, 1, 60, 320000, 19200000, N'Tôm sú loại 1'),
-- PN028: Nhập tôm sú (Đang soạn thảo)
(28, 8, 1, 100, 320000, 32000000, N'Tôm sú size đại'),
(28, 9, 1, 60, 280000, 16800000, N'Mực ống tươi'),
(28, 11, 1, 80, 85000, 6800000, N'Nghêu trắng'),
-- PN029: Nhập bia Tết (Đang soạn thảo)
(29, 41, 10, 80, 285000, 22800000, N'Bia SG Special'),
(29, 42, 10, 60, 320000, 19200000, N'Bia Tiger'),
(29, 43, 10, 50, 380000, 19000000, N'Bia Heineken'),
-- PN030: Nhập rượu vang (Đang soạn thảo)
(30, 49, 2, 50, 185000, 9250000, N'Rượu vang Đà Lạt'),
(30, 50, 2, 30, 125000, 3750000, N'Soju Hàn Quốc'),
(30, 51, 4, 20, 45000, 900000, N'Trà Lipton hộp 100'),
-- PN031: Nhập than BBQ (Đang soạn thảo)
(31, 65, 1, 50, 95000, 4750000, N'Than hoa bao 10kg'),
(31, 67, 2, 20, 45000, 900000, N'Bình gas mini'),
-- PN032: Nhập dụng cụ bếp (Đang soạn thảo)
(32, 83, 2, 20, 450000, 9000000, N'Nồi lẩu inox 2 ngăn'),
(32, 84, 2, 10, 1200000, 12000000, N'Bếp từ âm bàn'),
(32, 98, 2, 5, 2500000, 12500000, N'Xe đẩy phục vụ inox'),
-- PN033: Nhập máy POS (Đang soạn thảo)
(33, 90, 2, 2, 15000000, 30000000, N'Máy POS cảm ứng'),
(33, 91, 2, 3, 3500000, 10500000, N'Máy in bill Epson'),
-- PN034: Nhập gà ta (Đang soạn thảo)
(34, 6, 1, 60, 185000, 11100000, N'Gà ta nguyên con'),
(34, 7, 1, 30, 115000, 3450000, N'Cánh gà rán'),
-- PN035: Nhập rau organic (Đang soạn thảo)
(35, 17, 4, 40, 18000, 720000, N'Rau muống organic'),
(35, 18, 1, 30, 38000, 1140000, N'Cải thảo organic'),
(35, 21, 4, 80, 10000, 800000, N'Rau thơm organic'),
(35, 14, 4, 60, 20000, 1200000, N'Nấm kim châm'),
-- PN036: Hủy - hải sản kém chất lượng (Đã hủy)
(36, 8, 1, 40, 320000, 12800000, N'Tôm sú - không đạt'),
(36, 9, 1, 30, 280000, 8400000, N'Mực - không tươi'),
(36, 11, 1, 50, 85000, 4250000, N'Nghêu - có mùi'),
-- PN037: Hủy - trại heo kiểm dịch (Đã hủy)
(37, 4, 1, 80, 125000, 10000000, N'Ba rọi - trại đóng cửa'),
(37, 5, 1, 60, 155000, 9300000, N'Sườn non'),
-- PN038: Hủy - NCC ngừng hợp tác (Đã hủy)
(38, 6, 1, 30, 185000, 5550000, N'Gà vịt - NCC ngừng'),
(38, 40, 10, 10, 105000, 1050000, N'Trứng'),
-- PN039: Hủy - thay model (Đã hủy)
(39, 78, 2, 2, 18000000, 36000000, N'Tủ đông - đổi model'),
(39, 93, 2, 2, 12000000, 24000000, N'Máy lạnh - đổi model'),
-- PN040: Hủy - trùng đơn (Đã hủy)
(40, 10, 1, 30, 520000, 15600000, N'Cá hồi - trùng PN021'),
(40, 13, 1, 10, 1800000, 18000000, N'Tôm hùm - trùng PN021');
GO

/* =====================================================
   INVENTORY - Tồn kho hiện tại (dựa trên nhập đã xác nhận)
   warehouseId, materialId, quantity, updatedDate
===================================================== */
INSERT INTO Inventory (warehouseId, materialId, quantity, updatedDate) VALUES
-- Kho 1: Kho Lạnh - Thực Phẩm Tươi Sống
(1, 1, 80, '2025-02-01'),   -- Thịt bò Úc Striploin
(1, 2, 40, '2025-02-01'),   -- Thịt bò Mỹ Ribeye
(1, 3, 60, '2025-02-01'),   -- Ba chỉ bò cuộn lẩu
(1, 4, 150, '2025-02-01'),  -- Thịt heo ba rọi
(1, 5, 100, '2025-02-01'),  -- Sườn heo non
(1, 6, 80, '2025-02-01'),   -- Gà ta nguyên con
(1, 7, 50, '2025-02-01'),   -- Cánh gà rán
(1, 8, 80, '2025-02-01'),   -- Tôm sú loại 1
(1, 9, 50, '2025-02-01'),   -- Mực ống tươi
(1, 10, 30, '2025-02-01'),  -- Cá hồi fillet
(1, 11, 60, '2025-02-01'),  -- Nghêu trắng
(1, 12, 30, '2025-02-01'),  -- Bạch tuộc baby
(1, 13, 15, '2025-02-01'),  -- Tôm hùm Alaska
(1, 14, 200, '2025-02-01'), -- Nấm kim châm
(1, 15, 30, '2025-02-01'),  -- Nấm đùi gà
(1, 16, 20, '2025-02-01'),  -- Nấm hương khô
(1, 17, 80, '2025-02-01'),  -- Rau muống
(1, 18, 60, '2025-02-01'),  -- Cải thảo
(1, 19, 50, '2025-02-01'),  -- Rau nhút
(1, 20, 40, '2025-02-01'),  -- Bắp cải
(1, 21, 100, '2025-02-01'), -- Rau thơm
(1, 22, 50, '2025-02-01'),  -- Đậu hũ non
(1, 23, 40, '2025-02-01'),  -- Đậu hũ chiên
(1, 39, 15, '2025-02-01'),  -- Ớt tươi
(1, 40, 30, '2025-02-01'),  -- Trứng gà (khay)
-- Kho 2: Kho Khô - Gia Vị & Nguyên Liệu Khô
(2, 24, 80, '2025-02-01'),  -- Bún tươi
(2, 25, 60, '2025-02-01'),  -- Phở tươi
(2, 26, 40, '2025-02-01'),  -- Mì vàng
(2, 27, 10, '2025-02-01'),  -- Gạo ST25 (bao 25kg)
(2, 28, 50, '2025-02-01'),  -- Sa tế lẩu Thái
(2, 29, 80, '2025-02-01'),  -- Nước mắm
(2, 30, 60, '2025-02-01'),  -- Tương ớt
(2, 31, 50, '2025-02-01'),  -- Nước tương
(2, 32, 30, '2025-02-01'),  -- Dầu ăn 5L
(2, 33, 40, '2025-02-01'),  -- Dầu hào
(2, 34, 20, '2025-02-01'),  -- Bột nêm
(2, 35, 5, '2025-02-01'),   -- Muối hạt (bao 25kg)
(2, 36, 3, '2025-02-01'),   -- Đường (bao 50kg)
(2, 37, 10, '2025-02-01'),  -- Tiêu đen xay
(2, 38, 8, '2025-02-01'),   -- Tỏi băm
-- Kho 3: Kho Đồ Uống & Nước Giải Khát
(3, 41, 80, '2025-02-01'),  -- Bia SG Special (thùng)
(3, 42, 60, '2025-02-01'),  -- Bia Tiger (thùng)
(3, 43, 50, '2025-02-01'),  -- Bia Heineken (thùng)
(3, 44, 50, '2025-02-01'),  -- Coca-Cola (thùng)
(3, 45, 40, '2025-02-01'),  -- Pepsi (thùng)
(3, 46, 40, '2025-02-01'),  -- Nước suối (thùng)
(3, 47, 25, '2025-02-01'),  -- 7Up (thùng)
(3, 48, 25, '2025-02-01'),  -- Nước cam (thùng)
(3, 49, 30, '2025-02-01'),  -- Rượu vang
(3, 50, 40, '2025-02-01'),  -- Soju
(3, 51, 15, '2025-02-01'),  -- Trà Lipton
(3, 52, 20, '2025-02-01'),  -- Sữa đặc
(3, 53, 50, '2025-02-01'),  -- Đá viên (bao)
-- Kho 4: Kho Vật Tư & Bao Bì
(4, 54, 25, '2025-02-01'),  -- Khăn giấy ăn (thùng)
(4, 55, 15, '2025-02-01'),  -- Khăn ướt (thùng)
(4, 56, 20, '2025-02-01'),  -- Hộp xốp (thùng)
(4, 57, 30, '2025-02-01'),  -- Túi nilon (kg)
(4, 58, 8, '2025-02-01'),   -- Màng bọc TP
(4, 59, 5, '2025-02-01'),   -- Giấy bạc
(4, 60, 30, '2025-02-01'),  -- Găng tay nilon
(4, 61, 10, '2025-02-01'),  -- Tạp dề
(4, 62, 25, '2025-02-01'),  -- Nước rửa chén
(4, 63, 20, '2025-02-01'),  -- Nước lau sàn
(4, 64, 15, '2025-02-01'),  -- Nước tẩy bếp
(4, 65, 40, '2025-02-01'),  -- Than hoa BBQ
(4, 66, 20, '2025-02-01'),  -- Gas bình 12kg
(4, 67, 30, '2025-02-01'),  -- Gas mini
(4, 68, 20, '2025-02-01'),  -- Đũa 1 lần
(4, 69, 10, '2025-02-01'),  -- Ly nhựa dome
(4, 70, 8, '2025-02-01'),   -- Ống hút giấy
(4, 71, 15, '2025-02-01'),  -- Giấy in bill
(4, 74, 25, '2025-02-01'),  -- Bình xịt côn trùng
(4, 75, 40, '2025-02-01'),  -- Nước rửa tay
-- Kho 5: Kho Thiết Bị & Tài Sản
(5, 76, 4, '2025-02-01'),   -- Bếp gas CN 2 họng
(5, 77, 3, '2025-02-01'),   -- Bếp gas 1 họng áp suất
(5, 78, 4, '2025-02-01'),   -- Tủ đông 500L
(5, 79, 2, '2025-02-01'),   -- Tủ mát trưng bày
(5, 80, 2, '2025-02-01'),   -- Tủ lạnh CN 4 cánh
(5, 81, 2, '2025-02-01'),   -- Máy xay thịt
(5, 82, 2, '2025-02-01'),   -- Máy cắt thịt lát
(5, 83, 30, '2025-02-01'),  -- Nồi lẩu inox 2 ngăn
(5, 84, 15, '2025-02-01'),  -- Bếp từ âm bàn
(5, 85, 2, '2025-02-01'),   -- Máy rửa chén
(5, 86, 2, '2025-02-01'),   -- Hệ thống hút mùi
(5, 87, 15, '2025-02-01'),  -- Bàn ăn 4 người
(5, 88, 8, '2025-02-01'),   -- Bàn 6 người có bếp
(5, 89, 60, '2025-02-01'),  -- Ghế ăn bọc nệm
(5, 90, 3, '2025-02-01'),   -- Máy POS
(5, 91, 4, '2025-02-01'),   -- Máy in bill
(5, 92, 1, '2025-02-01'),   -- Camera an ninh
(5, 93, 4, '2025-02-01'),   -- Máy lạnh 2HP
(5, 94, 1, '2025-02-01'),   -- Quầy bar
(5, 95, 1, '2025-02-01'),   -- Tủ giữ nóng
(5, 96, 1, '2025-02-01'),   -- Máy ép trái cây
(5, 97, 2, '2025-02-01'),   -- Nồi nấu phở 100L
(5, 98, 5, '2025-02-01'),   -- Xe đẩy phục vụ
(5, 99, 1, '2025-02-01'),   -- Máy làm đá
(5, 100, 1, '2025-02-01');  -- Bảng hiệu LED
GO

/* =====================================================
   PURCHASE ORDERS (30) - 5 statuses:
   Đang soạn thảo (5), Chờ xác nhận (5), Đã xác nhận (10), Đã giao hàng (5), Đã hủy (5)
===================================================== */
INSERT INTO PurchaseOrder (code, poNumber, orderDate, supplierId, expectedDeliveryDate, totalAmount, status, createdBy, approvedBy, approvedAt, note, createdAt) VALUES
-- Đã xác nhận (10)
(N'DH001', N'PO-2025-001', '2025-01-03', 2, '2025-01-05', 45000000, N'Đã xác nhận', N'Nguyễn Văn An', N'Trần Thị Bình', '2025-01-04 08:00:00', N'Đặt thịt heo tuần 1', '2025-01-03 09:00:00'),
(N'DH002', N'PO-2025-002', '2025-01-03', 3, '2025-01-05', 40000000, N'Đã xác nhận', N'Nguyễn Văn An', N'Trần Thị Bình', '2025-01-04 08:00:00', N'Đặt hải sản tươi tuần 1', '2025-01-03 09:30:00'),
(N'DH003', N'PO-2025-003', '2025-01-04', 4, '2025-01-06', 10000000, N'Đã xác nhận', N'Lê Hoàng Nam', N'Trần Thị Bình', '2025-01-05 08:00:00', N'Đặt rau củ Đà Lạt', '2025-01-04 07:00:00'),
(N'DH004', N'PO-2025-004', '2025-01-05', 7, '2025-01-07', 55000000, N'Đã xác nhận', N'Lê Hoàng Nam', N'Nguyễn Văn An', '2025-01-06 08:00:00', N'Đặt bia các loại Tết', '2025-01-05 10:00:00'),
(N'DH005', N'PO-2025-005', '2025-01-06', 5, '2025-01-08', 15000000, N'Đã xác nhận', N'Trần Thị Lý', N'Nguyễn Văn An', '2025-01-07 09:00:00', N'Đặt gia vị nấu ăn', '2025-01-06 08:00:00'),
(N'DH006', N'PO-2025-006', '2025-01-08', 33, '2025-01-10', 70000000, N'Đã xác nhận', N'Nguyễn Văn An', N'Trần Thị Bình', '2025-01-09 08:00:00', N'Đặt thịt bò Úc nhập khẩu', '2025-01-08 09:00:00'),
(N'DH007', N'PO-2025-007', '2025-01-10', 15, '2025-01-12', 8000000, N'Đã xác nhận', N'Lê Hoàng Nam', N'Trần Thị Bình', '2025-01-11 08:00:00', N'Đặt nấm các loại', '2025-01-10 07:00:00'),
(N'DH008', N'PO-2025-008', '2025-01-12', 12, '2025-01-15', 200000000, N'Đã xác nhận', N'Phạm Minh Tuấn', N'Nguyễn Văn An', '2025-01-13 08:00:00', N'Đặt thiết bị bếp CN', '2025-01-12 09:00:00'),
(N'DH009', N'PO-2025-009', '2025-01-15', 19, '2025-01-18', 20000000, N'Đã xác nhận', N'Lê Hoàng Nam', N'Trần Thị Bình', '2025-01-16 08:00:00', N'Đặt nước ngọt Coca-Cola', '2025-01-15 08:00:00'),
(N'DH010', N'PO-2025-010', '2025-01-20', 20, '2025-01-25', 100000000, N'Đã xác nhận', N'Phạm Minh Tuấn', N'Nguyễn Văn An', '2025-01-21 08:00:00', N'Đặt bàn ghế nhà hàng', '2025-01-20 09:00:00'),
-- Đã giao hàng (5)
(N'DH011', N'PO-2025-011', '2025-01-22', 35, '2025-01-22', 5000000, N'Đã giao hàng', N'Nguyễn Văn An', N'Trần Thị Bình', '2025-01-22 07:00:00', N'Đặt trứng gà sạch', '2025-01-22 06:00:00'),
(N'DH012', N'PO-2025-012', '2025-01-25', 28, '2025-01-28', 8000000, N'Đã giao hàng', N'Phạm Minh Tuấn', N'Trần Thị Bình', '2025-01-26 08:00:00', N'Đặt hóa chất vệ sinh', '2025-01-25 08:00:00'),
(N'DH013', N'PO-2025-013', '2025-01-28', 17, '2025-02-01', 8000000, N'Đã giao hàng', N'Phạm Minh Tuấn', N'Nguyễn Văn An', '2025-01-29 08:00:00', N'Đặt gas bình nhà bếp', '2025-01-28 08:00:00'),
(N'DH014', N'PO-2025-014', '2025-02-01', 10, '2025-02-03', 8000000, N'Đã giao hàng', N'Trần Thị Lý', N'Nguyễn Văn An', '2025-02-02 08:00:00', N'Đặt bún phở tươi tuần 2', '2025-02-01 07:00:00'),
(N'DH015', N'PO-2025-015', '2025-02-01', 16, '2025-02-03', 10000000, N'Đã giao hàng', N'Phạm Minh Tuấn', N'Trần Thị Bình', '2025-02-02 08:00:00', N'Đặt bao bì đóng gói', '2025-02-01 09:00:00'),
-- Chờ xác nhận (5)
(N'DH016', N'PO-2025-016', '2025-02-05', 2, '2025-02-07', 35000000, N'Chờ xác nhận', N'Nguyễn Văn An', NULL, NULL, N'Đặt thịt heo tuần 2', '2025-02-05 06:30:00'),
(N'DH017', N'PO-2025-017', '2025-02-05', 3, '2025-02-07', 45000000, N'Chờ xác nhận', N'Nguyễn Văn An', NULL, NULL, N'Đặt hải sản tuần 2', '2025-02-05 07:00:00'),
(N'DH018', N'PO-2025-018', '2025-02-06', 42, '2025-02-08', 60000000, N'Chờ xác nhận', N'Nguyễn Văn An', NULL, NULL, N'Đặt hải sản đông lạnh cao cấp', '2025-02-06 08:00:00'),
(N'DH019', N'PO-2025-019', '2025-02-07', 21, '2025-02-10', 7000000, N'Chờ xác nhận', N'Trần Thị Lý', NULL, NULL, N'Đặt gạo ST25 Sóc Trăng', '2025-02-07 08:00:00'),
(N'DH020', N'PO-2025-020', '2025-02-08', 43, '2025-02-12', 50000000, N'Chờ xác nhận', N'Phạm Minh Tuấn', NULL, NULL, N'Đặt tủ đông & máy lạnh', '2025-02-08 09:00:00'),
-- Đang soạn thảo (5)
(N'DH021', N'PO-2025-021', '2025-02-10', 33, '2025-02-15', 85000000, N'Đang soạn thảo', N'Nguyễn Văn An', NULL, NULL, N'Đặt thịt bò Úc lô mới', '2025-02-10 06:30:00'),
(N'DH022', N'PO-2025-022', '2025-02-11', 39, '2025-02-16', 130000000, N'Đang soạn thảo', N'Nguyễn Văn An', NULL, NULL, N'Đặt tôm hùm cho event', '2025-02-11 07:00:00'),
(N'DH023', N'PO-2025-023', '2025-02-12', 7, '2025-02-18', 70000000, N'Đang soạn thảo', N'Lê Hoàng Nam', NULL, NULL, N'Đặt bia Tết đợt 2', '2025-02-12 09:00:00'),
(N'DH024', N'PO-2025-024', '2025-02-13', 22, '2025-02-21', 40000000, N'Đang soạn thảo', N'Phạm Minh Tuấn', NULL, NULL, N'Đặt dụng cụ bếp ProChef', '2025-02-13 08:00:00'),
(N'DH025', N'PO-2025-025', '2025-02-14', 48, '2025-02-22', 45000000, N'Đang soạn thảo', N'Phạm Minh Tuấn', NULL, NULL, N'Đặt máy POS mới', '2025-02-14 09:00:00'),
-- Đã hủy (5)
(N'DH026', N'PO-2025-026', '2025-01-08', 13, '2025-01-10', 30000000, N'Đã hủy', N'Nguyễn Văn An', NULL, NULL, N'Hủy - hải sản không đạt', '2025-01-08 06:00:00'),
(N'DH027', N'PO-2025-027', '2025-01-12', 18, '2025-01-15', 25000000, N'Đã hủy', N'Nguyễn Văn An', NULL, NULL, N'Hủy - trại heo kiểm dịch', '2025-01-12 07:00:00'),
(N'DH028', N'PO-2025-028', '2025-01-18', 23, '2025-01-20', 10000000, N'Đã hủy', N'Lê Hoàng Nam', NULL, NULL, N'Hủy - NCC ngừng hợp tác', '2025-01-18 08:00:00'),
(N'DH029', N'PO-2025-029', '2025-01-22', 43, '2025-01-25', 70000000, N'Đã hủy', N'Phạm Minh Tuấn', NULL, NULL, N'Hủy - thay đổi model TB', '2025-01-22 09:00:00'),
(N'DH030', N'PO-2025-030', '2025-01-28', 42, '2025-02-01', 50000000, N'Đã hủy', N'Nguyễn Văn An', NULL, NULL, N'Hủy - trùng đơn', '2025-01-28 07:00:00');
GO

/* =====================================================
   PURCHASE ORDER DETAILS
===================================================== */
INSERT INTO PurchaseOrderDetail (purchaseOrderId, materialId, unitId, quantity, unitPrice, amount, note) VALUES
-- DH001: Đặt thịt heo
(1, 4, 1, 120, 125000, 15000000, N'Ba rọi tươi'),
(1, 5, 1, 100, 155000, 15500000, N'Sườn heo non'),
(1, 6, 1, 50, 185000, 9250000, N'Gà ta'),
(1, 7, 1, 40, 115000, 4600000, N'Cánh gà'),
-- DH002: Đặt hải sản
(2, 8, 1, 60, 320000, 19200000, N'Tôm sú loại 1'),
(2, 9, 1, 40, 280000, 11200000, N'Mực ống tươi'),
(2, 11, 1, 50, 85000, 4250000, N'Nghêu trắng'),
(2, 12, 1, 20, 250000, 5000000, N'Bạch tuộc baby'),
-- DH003: Đặt rau củ
(3, 17, 4, 80, 15000, 1200000, N'Rau muống'),
(3, 18, 1, 60, 35000, 2100000, N'Cải thảo'),
(3, 14, 4, 200, 18000, 3600000, N'Nấm kim châm'),
(3, 20, 1, 50, 25000, 1250000, N'Bắp cải'),
(3, 21, 4, 150, 8000, 1200000, N'Rau thơm'),
-- DH004: Đặt bia
(4, 41, 10, 60, 285000, 17100000, N'Bia SG Special'),
(4, 42, 10, 50, 320000, 16000000, N'Bia Tiger'),
(4, 43, 10, 40, 380000, 15200000, N'Bia Heineken'),
(4, 50, 10, 30, 218000, 6540000, N'Soju'),
-- DH005: Đặt gia vị
(5, 28, 4, 50, 65000, 3250000, N'Sa tế lẩu'),
(5, 29, 4, 60, 45000, 2700000, N'Nước mắm'),
(5, 32, 4, 30, 125000, 3750000, N'Dầu ăn 5L'),
(5, 33, 4, 50, 42000, 2100000, N'Dầu hào'),
(5, 34, 1, 20, 85000, 1700000, N'Bột nêm'),
-- DH006: Đặt thịt bò
(6, 1, 1, 60, 520000, 31200000, N'Striploin'),
(6, 2, 1, 30, 680000, 20400000, N'Ribeye'),
(6, 3, 1, 40, 520000, 20800000, N'Ba chỉ bò cuộn'),
-- DH007: Đặt nấm
(7, 14, 4, 200, 18000, 3600000, N'Nấm kim châm'),
(7, 15, 1, 30, 85000, 2550000, N'Nấm đùi gà'),
(7, 16, 1, 15, 140000, 2100000, N'Nấm hương'),
-- DH008: Đặt thiết bị bếp
(8, 76, 2, 3, 8500000, 25500000, N'Bếp gas CN'),
(8, 78, 2, 3, 18000000, 54000000, N'Tủ đông 500L'),
(8, 80, 2, 1, 25000000, 25000000, N'Tủ lạnh 4 cánh'),
(8, 82, 2, 1, 35000000, 35000000, N'Máy cắt thịt'),
(8, 85, 2, 1, 45000000, 45000000, N'Máy rửa chén'),
-- DH009: Đặt nước ngọt
(9, 44, 10, 40, 195000, 7800000, N'Coca-Cola'),
(9, 45, 10, 30, 185000, 5550000, N'Pepsi'),
(9, 46, 10, 30, 72000, 2160000, N'Nước suối'),
(9, 47, 10, 20, 195000, 3900000, N'7Up'),
-- DH010: Đặt bàn ghế
(10, 87, 2, 12, 3500000, 42000000, N'Bàn 4 người'),
(10, 88, 2, 6, 5500000, 33000000, N'Bàn 6 người bếp lẩu'),
(10, 89, 2, 60, 650000, 39000000, N'Ghế bọc nệm'),
-- DH011: Đặt trứng
(11, 40, 10, 25, 105000, 2625000, N'Trứng gà khay 30'),
(11, 22, 4, 50, 32000, 1600000, N'Đậu hũ non'),
-- DH012: Đặt hóa chất VS
(12, 62, 2, 30, 85000, 2550000, N'Nước rửa chén'),
(12, 63, 2, 20, 75000, 1500000, N'Nước lau sàn'),
(12, 64, 2, 15, 125000, 1875000, N'Nước tẩy bếp'),
(12, 75, 2, 40, 52000, 2080000, N'Nước rửa tay'),
-- DH013: Đặt gas
(13, 66, 2, 15, 420000, 6300000, N'Gas bình 12kg'),
(13, 67, 2, 30, 45000, 1350000, N'Gas mini'),
-- DH014: Đặt bún phở
(14, 24, 1, 120, 25000, 3000000, N'Bún tươi'),
(14, 25, 1, 100, 28000, 2800000, N'Phở tươi'),
(14, 26, 1, 60, 22000, 1320000, N'Mì vàng'),
-- DH015: Đặt bao bì
(15, 56, 4, 15, 285000, 4275000, N'Hộp xốp'),
(15, 57, 1, 25, 45000, 1125000, N'Túi nilon'),
(15, 60, 4, 30, 65000, 1950000, N'Găng tay'),
(15, 54, 4, 20, 95000, 1900000, N'Khăn giấy ăn'),
-- DH016-020: Chờ xác nhận (same pattern)
(16, 4, 1, 100, 125000, 12500000, N'Ba rọi'),
(16, 5, 1, 80, 155000, 12400000, N'Sườn non'),
(16, 6, 1, 50, 185000, 9250000, N'Gà ta'),
(17, 8, 1, 70, 320000, 22400000, N'Tôm sú'),
(17, 9, 1, 50, 280000, 14000000, N'Mực ống'),
(17, 11, 1, 60, 85000, 5100000, N'Nghêu'),
(18, 10, 1, 40, 520000, 20800000, N'Cá hồi'),
(18, 13, 1, 15, 1800000, 27000000, N'Tôm hùm'),
(18, 8, 1, 40, 320000, 12800000, N'Tôm sú size lớn'),
(19, 27, 1, 25, 280000, 7000000, N'Gạo ST25'),
(20, 78, 2, 1, 18000000, 18000000, N'Tủ đông'),
(20, 93, 2, 2, 12000000, 24000000, N'Máy lạnh'),
-- DH021-025: Đang soạn thảo
(21, 1, 1, 80, 520000, 41600000, N'Bò Úc Striploin'),
(21, 2, 1, 40, 680000, 27200000, N'Bò Mỹ Ribeye'),
(22, 13, 1, 50, 1800000, 90000000, N'Tôm hùm Alaska'),
(22, 10, 1, 40, 520000, 20800000, N'Cá hồi fillet'),
(23, 41, 10, 100, 285000, 28500000, N'Bia SG Special'),
(23, 42, 10, 80, 320000, 25600000, N'Bia Tiger'),
(23, 43, 10, 50, 380000, 19000000, N'Bia Heineken'),
(24, 83, 2, 30, 450000, 13500000, N'Nồi lẩu 2 ngăn'),
(24, 84, 2, 15, 1200000, 18000000, N'Bếp từ âm bàn'),
(25, 90, 2, 3, 15000000, 45000000, N'Máy POS'),
-- DH026-030: Đã hủy
(26, 8, 1, 50, 320000, 16000000, N'Tôm sú - hủy'),
(26, 9, 1, 40, 280000, 11200000, N'Mực ống - hủy'),
(27, 4, 1, 100, 125000, 12500000, N'Ba rọi - hủy'),
(27, 5, 1, 80, 155000, 12400000, N'Sườn - hủy'),
(28, 6, 1, 40, 185000, 7400000, N'Gà - NCC ngừng'),
(29, 78, 2, 2, 18000000, 36000000, N'Tủ đông - hủy'),
(29, 93, 2, 2, 12000000, 24000000, N'Máy lạnh - hủy'),
(30, 10, 1, 40, 520000, 20800000, N'Cá hồi - trùng'),
(30, 13, 1, 10, 1800000, 18000000, N'Tôm hùm - trùng');
GO

/* =====================================================
   EXPORT RECEIPTS (25) - 4 statuses:
   Đang soạn thảo (5), Chờ xác nhận (5), Đã xác nhận (12), Đã hủy (3)
===================================================== */
INSERT INTO ExportReceipt (code, receiptNumber, exportDate, warehouseId, receiverName, reason, documentNo, totalAmount, status, createdBy, approvedBy, approvedAt, note, createdAt) VALUES
-- Đã xác nhận (12)
(N'PX001', N'PX-2025-001', '2025-01-06 17:00:00', 1, N'Bếp chính - Ca tối', N'Xuất chế biến', N'XK-001', 18500000, N'Approved', N'Nguyễn Văn An', N'Trần Thị Bình', '2025-01-06 17:30:00', N'Xuất thịt, hải sản cho ca tối', '2025-01-06 16:30:00'),
(N'PX002', N'PX-2025-002', '2025-01-07 06:00:00', 1, N'Bếp chính - Ca sáng', N'Xuất chế biến', N'XK-002', 5200000, N'Approved', N'Lê Hoàng Nam', N'Trần Thị Bình', '2025-01-07 06:30:00', N'Xuất rau củ, nấm buổi sáng', '2025-01-07 05:30:00'),
(N'PX003', N'PX-2025-003', '2025-01-07 17:00:00', 3, N'Quầy bar', N'Xuất bán hàng', N'XK-003', 12500000, N'Approved', N'Lê Hoàng Nam', N'Nguyễn Văn An', '2025-01-07 17:30:00', N'Xuất bia, nước ngọt ca tối', '2025-01-07 16:30:00'),
(N'PX004', N'PX-2025-004', '2025-01-08 16:00:00', 2, N'Bếp chính', N'Xuất chế biến', N'XK-004', 4800000, N'Approved', N'Trần Thị Lý', N'Nguyễn Văn An', '2025-01-08 16:30:00', N'Xuất gia vị, bún phở', '2025-01-08 15:30:00'),
(N'PX005', N'PX-2025-005', '2025-01-10 17:00:00', 1, N'Bếp lẩu - Tầng 2', N'Xuất chế biến', N'XK-005', 32000000, N'Approved', N'Nguyễn Văn An', N'Trần Thị Bình', '2025-01-10 17:30:00', N'Xuất thịt bò, hải sản cho lẩu', '2025-01-10 16:30:00'),
(N'PX006', N'PX-2025-006', '2025-01-12 06:00:00', 4, N'Nhà vệ sinh + Sảnh', N'Xuất sử dụng', N'XK-006', 3200000, N'Approved', N'Phạm Minh Tuấn', N'Trần Thị Bình', '2025-01-12 06:30:00', N'Xuất vệ sinh, khăn giấy', '2025-01-12 05:30:00'),
(N'PX007', N'PX-2025-007', '2025-01-15 17:00:00', 1, N'Bếp chính - Tiệc', N'Xuất chế biến', N'XK-007', 45000000, N'Approved', N'Nguyễn Văn An', N'Trần Thị Bình', '2025-01-15 17:30:00', N'Xuất nguyên liệu tiệc 30 bàn', '2025-01-15 16:00:00'),
(N'PX008', N'PX-2025-008', '2025-01-18 17:00:00', 3, N'Quầy bar - Tiệc', N'Xuất bán hàng', N'XK-008', 22000000, N'Approved', N'Lê Hoàng Nam', N'Nguyễn Văn An', '2025-01-18 17:30:00', N'Xuất đồ uống tiệc cuối tuần', '2025-01-18 16:00:00'),
(N'PX009', N'PX-2025-009', '2025-01-20 06:00:00', 4, N'Bếp + Phục vụ', N'Xuất sử dụng', N'XK-009', 5500000, N'Approved', N'Phạm Minh Tuấn', N'Trần Thị Bình', '2025-01-20 06:30:00', N'Xuất bao bì, găng tay, gas', '2025-01-20 05:30:00'),
(N'PX010', N'PX-2025-010', '2025-01-22 17:00:00', 1, N'Bếp BBQ ngoài trời', N'Xuất chế biến', N'XK-010', 15000000, N'Approved', N'Nguyễn Văn An', N'Trần Thị Bình', '2025-01-22 17:30:00', N'Xuất thịt, hải sản BBQ', '2025-01-22 16:00:00'),
(N'PX011', N'PX-2025-011', '2025-01-25 17:00:00', 1, N'Bếp chính + Lẩu', N'Xuất chế biến', N'XK-011', 28000000, N'Approved', N'Nguyễn Văn An', N'Trần Thị Bình', '2025-01-25 17:30:00', N'Xuất cuối tuần đông khách', '2025-01-25 16:00:00'),
(N'PX012', N'PX-2025-012', '2025-02-01 06:00:00', 2, N'Bếp chính', N'Xuất chế biến', N'XK-012', 6500000, N'Approved', N'Trần Thị Lý', N'Nguyễn Văn An', '2025-02-01 06:30:00', N'Xuất gia vị, dầu ăn đầu tháng', '2025-02-01 05:30:00'),
-- Chờ xác nhận (5)
(N'PX013', N'PX-2025-013', '2025-02-03 16:00:00', 1, N'Bếp chính - Ca tối', N'Xuất chế biến', N'XK-013', 20000000, N'Pending', N'Nguyễn Văn An', NULL, NULL, N'Xuất thịt, hải sản ca tối', '2025-02-03 15:00:00'),
(N'PX014', N'PX-2025-014', '2025-02-04 06:00:00', 1, N'Bếp lẩu', N'Xuất chế biến', N'XK-014', 8500000, N'Pending', N'Lê Hoàng Nam', NULL, NULL, N'Xuất rau, nấm, đậu hũ cho lẩu', '2025-02-04 05:30:00'),
(N'PX015', N'PX-2025-015', '2025-02-05 16:00:00', 3, N'Quầy bar', N'Xuất bán hàng', N'XK-015', 15000000, N'Pending', N'Lê Hoàng Nam', NULL, NULL, N'Xuất bia, nước ngọt cuối tuần', '2025-02-05 15:00:00'),
(N'PX016', N'PX-2025-016', '2025-02-06 06:00:00', 4, N'Phục vụ + WC', N'Xuất sử dụng', N'XK-016', 2800000, N'Pending', N'Phạm Minh Tuấn', NULL, NULL, N'Xuất khăn giấy, vệ sinh', '2025-02-06 05:30:00'),
(N'PX017', N'PX-2025-017', '2025-02-07 16:00:00', 1, N'Bếp chính + BBQ', N'Xuất chế biến', N'XK-017', 25000000, N'Pending', N'Nguyễn Văn An', NULL, NULL, N'Xuất nguyên liệu tiệc BBQ', '2025-02-07 15:00:00'),
-- Đang soạn thảo (5)
(N'PX018', N'PX-2025-018', '2025-02-08 16:00:00', 1, N'Bếp chính', N'Xuất chế biến', NULL, 18000000, N'Draft', N'Nguyễn Văn An', NULL, NULL, N'Dự kiến xuất thịt bò event', '2025-02-08 15:00:00'),
(N'PX019', N'PX-2025-019', '2025-02-09 06:00:00', 1, N'Bếp lẩu VIP', N'Xuất chế biến', NULL, 35000000, N'Draft', N'Nguyễn Văn An', NULL, NULL, N'Dự kiến xuất tôm hùm VIP', '2025-02-09 05:00:00'),
(N'PX020', N'PX-2025-020', '2025-02-10 16:00:00', 3, N'Quầy bar - Event', N'Xuất bán hàng', NULL, 30000000, N'Draft', N'Lê Hoàng Nam', NULL, NULL, N'Dự kiến xuất bia rượu event', '2025-02-10 15:00:00'),
(N'PX021', N'PX-2025-021', '2025-02-11 06:00:00', 4, N'Toàn bộ nhà hàng', N'Xuất sử dụng', NULL, 8000000, N'Draft', N'Phạm Minh Tuấn', NULL, NULL, N'Dự kiến xuất vật tư tháng', '2025-02-11 05:00:00'),
(N'PX022', N'PX-2025-022', '2025-02-12 16:00:00', 1, N'Bếp chính', N'Xuất chế biến', NULL, 22000000, N'Draft', N'Nguyễn Văn An', NULL, NULL, N'Dự kiến xuất cuối tuần', '2025-02-12 15:00:00'),
-- Đã hủy (3)
(N'PX023', N'PX-2025-023', '2025-01-10 16:00:00', 1, N'Bếp phụ', N'Xuất chế biến', N'XK-023', 12000000, N'Cancelled', N'Lê Hoàng Nam', NULL, NULL, N'Hủy - đổi menu', '2025-01-10 15:00:00'),
(N'PX024', N'PX-2025-024', '2025-01-15 06:00:00', 3, N'Quầy bar', N'Xuất bán hàng', N'XK-024', 8000000, N'Cancelled', N'Lê Hoàng Nam', NULL, NULL, N'Hủy - đặt nhầm', '2025-01-15 05:00:00'),
(N'PX025', N'PX-2025-025', '2025-01-20 16:00:00', 1, N'Bếp chính', N'Xuất chế biến', N'XK-025', 15000000, N'Cancelled', N'Nguyễn Văn An', NULL, NULL, N'Hủy - tiệc bị hủy', '2025-01-20 15:00:00');
GO

/* =====================================================
   EXPORT RECEIPT DETAILS
===================================================== */
INSERT INTO ExportReceiptDetail (exportReceiptId, materialId, unitId, quantity, unitPrice, amount, note) VALUES
-- PX001: Xuất thịt, hải sản ca tối
(1, 4, 1, 30, 125000, 3750000, N'Ba rọi cho nướng'),
(1, 8, 1, 20, 320000, 6400000, N'Tôm sú lẩu'),
(1, 3, 1, 10, 520000, 5200000, N'Ba chỉ bò cuộn lẩu'),
(1, 9, 1, 10, 280000, 2800000, N'Mực ống'),
-- PX002: Xuất rau củ sáng
(2, 17, 4, 20, 15000, 300000, N'Rau muống'),
(2, 18, 1, 15, 35000, 525000, N'Cải thảo'),
(2, 14, 4, 50, 18000, 900000, N'Nấm kim châm'),
(2, 21, 4, 40, 8000, 320000, N'Rau thơm'),
(2, 22, 4, 20, 32000, 640000, N'Đậu hũ non'),
(2, 20, 1, 15, 25000, 375000, N'Bắp cải'),
(2, 15, 1, 10, 85000, 850000, N'Nấm đùi gà'),
-- PX003: Xuất bia nước ngọt
(3, 41, 10, 15, 285000, 4275000, N'Bia SG Special'),
(3, 42, 10, 10, 320000, 3200000, N'Bia Tiger'),
(3, 43, 10, 8, 380000, 3040000, N'Bia Heineken'),
(3, 44, 10, 5, 195000, 975000, N'Coca-Cola'),
(3, 53, 1, 10, 95000, 950000, N'Đá viên'),
-- PX004: Xuất gia vị bún phở
(4, 28, 4, 10, 65000, 650000, N'Sa tế lẩu'),
(4, 29, 4, 15, 45000, 675000, N'Nước mắm'),
(4, 32, 4, 5, 125000, 625000, N'Dầu ăn'),
(4, 24, 1, 30, 25000, 750000, N'Bún tươi'),
(4, 25, 1, 20, 28000, 560000, N'Phở tươi'),
(4, 34, 1, 3, 85000, 255000, N'Bột nêm'),
-- PX005: Xuất thịt bò, hải sản lẩu
(5, 1, 1, 20, 520000, 10400000, N'Bò Striploin'),
(5, 3, 1, 15, 520000, 7800000, N'Ba chỉ bò cuộn'),
(5, 8, 1, 20, 320000, 6400000, N'Tôm sú'),
(5, 9, 1, 15, 280000, 4200000, N'Mực ống'),
(5, 11, 1, 20, 85000, 1700000, N'Nghêu'),
-- PX006: Xuất vệ sinh
(6, 54, 4, 10, 95000, 950000, N'Khăn giấy'),
(6, 55, 4, 5, 128000, 640000, N'Khăn ướt'),
(6, 62, 2, 5, 85000, 425000, N'Nước rửa chén'),
(6, 63, 2, 5, 75000, 375000, N'Nước lau sàn'),
(6, 75, 2, 10, 52000, 520000, N'Nước rửa tay'),
-- PX007: Xuất tiệc 30 bàn
(7, 1, 1, 30, 520000, 15600000, N'Bò Striploin'),
(7, 8, 1, 30, 320000, 9600000, N'Tôm sú'),
(7, 13, 1, 5, 1800000, 9000000, N'Tôm hùm'),
(7, 10, 1, 10, 520000, 5200000, N'Cá hồi'),
(7, 9, 1, 15, 280000, 4200000, N'Mực ống'),
-- PX008: Xuất đồ uống tiệc
(8, 41, 10, 25, 285000, 7125000, N'Bia SG Special'),
(8, 43, 10, 15, 380000, 5700000, N'Bia Heineken'),
(8, 49, 2, 20, 185000, 3700000, N'Rượu vang'),
(8, 50, 2, 20, 125000, 2500000, N'Soju'),
(8, 53, 1, 30, 95000, 2850000, N'Đá viên'),
-- PX009: Xuất bao bì, gas
(9, 56, 4, 5, 285000, 1425000, N'Hộp xốp'),
(9, 60, 4, 10, 65000, 650000, N'Găng tay'),
(9, 66, 2, 5, 420000, 2100000, N'Gas bình 12kg'),
(9, 68, 4, 5, 35000, 175000, N'Đũa 1 lần'),
(9, 57, 1, 10, 45000, 450000, N'Túi nilon'),
-- PX010: Xuất BBQ
(10, 4, 1, 30, 125000, 3750000, N'Ba rọi nướng'),
(10, 8, 1, 15, 320000, 4800000, N'Tôm sú nướng'),
(10, 6, 1, 15, 185000, 2775000, N'Gà ta nướng'),
(10, 65, 1, 20, 95000, 1900000, N'Than hoa'),
(10, 9, 1, 5, 280000, 1400000, N'Mực nướng'),
-- PX011: Xuất cuối tuần
(11, 1, 1, 20, 520000, 10400000, N'Bò Striploin'),
(11, 3, 1, 10, 520000, 5200000, N'Ba chỉ bò'),
(11, 8, 1, 15, 320000, 4800000, N'Tôm sú'),
(11, 4, 1, 20, 125000, 2500000, N'Ba rọi heo'),
(11, 14, 4, 80, 18000, 1440000, N'Nấm kim châm'),
(11, 18, 1, 20, 35000, 700000, N'Cải thảo'),
-- PX012: Xuất gia vị đầu tháng
(12, 32, 4, 10, 125000, 1250000, N'Dầu ăn 5L'),
(12, 28, 4, 15, 65000, 975000, N'Sa tế'),
(12, 29, 4, 20, 45000, 900000, N'Nước mắm'),
(12, 33, 4, 15, 42000, 630000, N'Dầu hào'),
(12, 34, 1, 5, 85000, 425000, N'Bột nêm'),
(12, 30, 4, 15, 35000, 525000, N'Tương ớt'),
-- PX013-017: Chờ xác nhận
(13, 4, 1, 40, 125000, 5000000, N'Ba rọi'),
(13, 8, 1, 25, 320000, 8000000, N'Tôm sú'),
(13, 1, 1, 10, 520000, 5200000, N'Bò Striploin'),
(14, 18, 1, 20, 35000, 700000, N'Cải thảo'),
(14, 14, 4, 100, 18000, 1800000, N'Nấm kim châm'),
(14, 22, 4, 30, 32000, 960000, N'Đậu hũ non'),
(14, 15, 1, 15, 85000, 1275000, N'Nấm đùi gà'),
(15, 41, 10, 20, 285000, 5700000, N'Bia SG'),
(15, 42, 10, 15, 320000, 4800000, N'Bia Tiger'),
(15, 43, 10, 10, 380000, 3800000, N'Bia Heineken'),
(16, 54, 4, 10, 95000, 950000, N'Khăn giấy'),
(16, 55, 4, 5, 128000, 640000, N'Khăn ướt'),
(16, 75, 2, 15, 52000, 780000, N'Nước rửa tay'),
(17, 1, 1, 15, 520000, 7800000, N'Bò Striploin'),
(17, 4, 1, 30, 125000, 3750000, N'Ba rọi'),
(17, 8, 1, 20, 320000, 6400000, N'Tôm sú'),
(17, 65, 1, 30, 95000, 2850000, N'Than hoa'),
-- PX018-022: Đang soạn thảo
(18, 1, 1, 15, 520000, 7800000, N'Bò Striploin'),
(18, 2, 1, 10, 680000, 6800000, N'Bò Ribeye'),
(19, 13, 1, 10, 1800000, 18000000, N'Tôm hùm'),
(19, 10, 1, 15, 520000, 7800000, N'Cá hồi'),
(19, 8, 1, 30, 320000, 9600000, N'Tôm sú'),
(20, 41, 10, 30, 285000, 8550000, N'Bia SG'),
(20, 43, 10, 20, 380000, 7600000, N'Bia Heineken'),
(20, 49, 2, 30, 185000, 5550000, N'Rượu vang'),
(20, 50, 2, 40, 125000, 5000000, N'Soju'),
(21, 56, 4, 10, 285000, 2850000, N'Hộp xốp'),
(21, 60, 4, 20, 65000, 1300000, N'Găng tay'),
(21, 66, 2, 8, 420000, 3360000, N'Gas bình'),
(22, 4, 1, 40, 125000, 5000000, N'Ba rọi'),
(22, 8, 1, 25, 320000, 8000000, N'Tôm sú'),
(22, 3, 1, 15, 520000, 7800000, N'Ba chỉ bò'),
-- PX023-025: Đã hủy
(23, 4, 1, 30, 125000, 3750000, N'Ba rọi - hủy'),
(23, 8, 1, 15, 320000, 4800000, N'Tôm sú - hủy'),
(24, 41, 10, 10, 285000, 2850000, N'Bia SG - hủy'),
(24, 43, 10, 8, 380000, 3040000, N'Heineken - hủy'),
(25, 1, 1, 10, 520000, 5200000, N'Bò Striploin - hủy'),
(25, 8, 1, 20, 320000, 6400000, N'Tôm sú - hủy');
GO

/* =====================================================
   STOCK CHECKS (10) - 4 statuses:
   Nháp (3), Đã trình (3), Đã duyệt (3), Đã hủy (1)
===================================================== */
INSERT INTO StockCheck (code, name, warehouseId, startDate, endDate, checkTime, createdBy, approvedBy, approvedAt, status, note, createdTime) VALUES
-- Đã duyệt (3)
(N'KK001', N'Kiểm kê kho lạnh tháng 1', 1, '2025-01-28', '2025-01-28', '2025-01-28 20:00:00', N'Phạm Minh Tuấn', N'Nguyễn Văn An', '2025-01-29 08:00:00', N'Đã duyệt', N'Kiểm kê cuối tháng kho thực phẩm', '2025-01-27 09:00:00'),
(N'KK002', N'Kiểm kê kho đồ uống tháng 1', 3, '2025-01-29', '2025-01-29', '2025-01-29 21:00:00', N'Lê Hoàng Nam', N'Nguyễn Văn An', '2025-01-30 08:00:00', N'Đã duyệt', N'Kiểm kê bia rượu nước ngọt', '2025-01-28 09:00:00'),
(N'KK003', N'Kiểm kê kho vật tư tháng 1', 4, '2025-01-30', '2025-01-30', '2025-01-30 18:00:00', N'Phạm Minh Tuấn', N'Nguyễn Văn An', '2025-01-31 08:00:00', N'Đã duyệt', N'Kiểm kê bao bì, vệ sinh', '2025-01-29 09:00:00'),
-- Đã trình (3)
(N'KK004', N'Kiểm kê kho lạnh đầu T2', 1, '2025-02-03', '2025-02-03', '2025-02-03 20:00:00', N'Phạm Minh Tuấn', NULL, NULL, N'Đã trình', N'Kiểm kê đầu tháng 2', '2025-02-02 09:00:00'),
(N'KK005', N'Kiểm kê kho gia vị T2', 2, '2025-02-04', '2025-02-04', '2025-02-04 18:00:00', N'Trần Thị Lý', NULL, NULL, N'Đã trình', N'Kiểm tra tồn gia vị', '2025-02-03 09:00:00'),
(N'KK006', N'Kiểm kê thiết bị bếp', 5, '2025-02-05', '2025-02-05', '2025-02-05 20:00:00', N'Phạm Minh Tuấn', NULL, NULL, N'Đã trình', N'Kiểm tra tài sản thiết bị', '2025-02-04 09:00:00'),
-- Nháp (3)
(N'KK007', N'Kiểm kê kho đồ uống T2', 3, '2025-02-10', NULL, NULL, N'Lê Hoàng Nam', NULL, NULL, N'Nháp', N'Chuẩn bị kiểm kê', '2025-02-09 09:00:00'),
(N'KK008', N'Kiểm kê kho lạnh giữa T2', 1, '2025-02-15', NULL, NULL, N'Nguyễn Văn An', NULL, NULL, N'Nháp', N'Kiểm kê giữa tháng', '2025-02-14 09:00:00'),
(N'KK009', N'Kiểm kê toàn bộ cuối T2', 1, '2025-02-28', NULL, NULL, N'Phạm Minh Tuấn', NULL, NULL, N'Nháp', N'Kiểm kê cuối tháng 2', '2025-02-25 09:00:00'),
-- Đã hủy (1)
(N'KK010', N'Kiểm kê kho lạnh - Hủy', 1, '2025-01-15', '2025-01-15', '2025-01-15 20:00:00', N'Lê Hoàng Nam', NULL, NULL, N'Đã hủy', N'Hủy do trùng lịch tiệc', '2025-01-14 09:00:00');
GO

/* =====================================================
   STOCK CHECK TEAMS
===================================================== */
INSERT INTO StockCheckTeam (stockCheckId, name, role, note) VALUES
-- KK001
(1, N'Phạm Minh Tuấn', N'Trưởng ban', N'Quản lý kho'),
(1, N'Nguyễn Văn An', N'Thành viên', N'Bếp trưởng'),
(1, N'Trần Thị Lý', N'Thư ký', N'Ghi chép số liệu'),
-- KK002
(2, N'Lê Hoàng Nam', N'Trưởng ban', N'Quản lý bar'),
(2, N'Phạm Minh Tuấn', N'Thành viên', N'Hỗ trợ kiểm đếm'),
(2, N'Trần Thị Bình', N'Thư ký', N'Ghi chép'),
-- KK003
(3, N'Phạm Minh Tuấn', N'Trưởng ban', N'Quản lý kho'),
(3, N'Lê Hoàng Nam', N'Thành viên', N'Hỗ trợ'),
-- KK004
(4, N'Phạm Minh Tuấn', N'Trưởng ban', N'Quản lý kho'),
(4, N'Nguyễn Văn An', N'Thành viên', N'Bếp trưởng'),
(4, N'Trần Thị Lý', N'Thư ký', N'Ghi chép'),
-- KK005
(5, N'Trần Thị Lý', N'Trưởng ban', N'Phụ trách gia vị'),
(5, N'Phạm Minh Tuấn', N'Thành viên', N'Hỗ trợ'),
-- KK006
(6, N'Phạm Minh Tuấn', N'Trưởng ban', N'Quản lý thiết bị'),
(6, N'Nguyễn Văn An', N'Thành viên', N'Bếp trưởng kiểm tra'),
(6, N'Lê Hoàng Nam', N'Thành viên', N'Hỗ trợ');
GO

/* =====================================================
   STOCK CHECK DETAILS
===================================================== */
INSERT INTO StockCheckDetail (stockCheckId, materialId, systemQuantity, actualQuantity, difference, warehouseId, handlingProposal, recordedCheck, status) VALUES
-- KK001: Kiểm kê kho lạnh T1 (Đã duyệt)
(1, 1, 80, 78, -2, 1, N'Hao hụt tự nhiên khi rã đông', 1, N'Đã xử lý'),
(1, 4, 150, 148, -2, 1, N'Hao hụt do cắt', 1, N'Đã xử lý'),
(1, 8, 80, 80, 0, 1, NULL, 1, N'Khớp'),
(1, 9, 50, 49, -1, 1, N'Hao hụt bảo quản', 1, N'Đã xử lý'),
(1, 14, 200, 195, -5, 1, N'Hết hạn loại bỏ', 1, N'Đã xử lý'),
(1, 18, 60, 58, -2, 1, N'Héo bỏ', 1, N'Đã xử lý'),
(1, 40, 30, 30, 0, 1, NULL, 1, N'Khớp'),
-- KK002: Kiểm kê kho đồ uống T1 (Đã duyệt)
(2, 41, 80, 80, 0, 3, NULL, 1, N'Khớp'),
(2, 42, 60, 59, -1, 3, N'Lon bị móp loại bỏ', 1, N'Đã xử lý'),
(2, 43, 50, 50, 0, 3, NULL, 1, N'Khớp'),
(2, 44, 50, 50, 0, 3, NULL, 1, N'Khớp'),
(2, 49, 30, 28, -2, 3, N'Chai bị nứt', 1, N'Đã xử lý'),
(2, 53, 50, 48, -2, 3, N'Đá tan', 1, N'Đã xử lý'),
-- KK003: Kiểm kê kho vật tư T1 (Đã duyệt)
(3, 54, 25, 25, 0, 4, NULL, 1, N'Khớp'),
(3, 56, 20, 18, -2, 4, N'Hộp bị nát', 1, N'Đã xử lý'),
(3, 60, 30, 30, 0, 4, NULL, 1, N'Khớp'),
(3, 66, 20, 20, 0, 4, NULL, 1, N'Khớp'),
(3, 74, 25, 24, -1, 4, N'Bình xịt hết gas', 1, N'Đã xử lý'),
-- KK004: Kiểm kê kho lạnh đầu T2 (Đã trình)
(4, 1, 78, 76, -2, 1, N'Hao hụt thịt bò', 1, N'Chờ duyệt'),
(4, 3, 60, 58, -2, 1, N'Hao hụt ba chỉ cuộn', 1, N'Chờ duyệt'),
(4, 8, 80, 78, -2, 1, N'Tôm hao hụt trọng lượng', 1, N'Chờ duyệt'),
(4, 11, 60, 55, -5, 1, N'Nghêu chết loại bỏ', 1, N'Chờ duyệt'),
(4, 17, 80, 75, -5, 1, N'Rau héo loại bỏ', 1, N'Chờ duyệt'),
-- KK005: Kiểm kê gia vị T2 (Đã trình)
(5, 28, 50, 48, -2, 2, N'Sa tế hao hụt', 1, N'Chờ duyệt'),
(5, 29, 80, 80, 0, 2, NULL, 1, N'Khớp'),
(5, 32, 30, 30, 0, 2, NULL, 1, N'Khớp'),
(5, 34, 20, 18, -2, 2, N'Bột nêm vón cục', 1, N'Chờ duyệt'),
-- KK006: Kiểm kê thiết bị (Đã trình)
(6, 76, 4, 4, 0, 5, NULL, 1, N'Khớp'),
(6, 78, 4, 4, 0, 5, NULL, 1, N'Khớp'),
(6, 83, 30, 28, -2, 5, N'Nồi lẩu hỏng cần thay', 1, N'Chờ duyệt'),
(6, 84, 15, 14, -1, 5, N'Bếp từ hỏng 1 cái', 1, N'Chờ duyệt'),
(6, 89, 60, 58, -2, 5, N'Ghế hỏng cần sửa', 1, N'Chờ duyệt');
GO
