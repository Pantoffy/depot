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
