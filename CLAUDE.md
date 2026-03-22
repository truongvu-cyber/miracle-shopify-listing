# Miracle Shopify Listing

## Mô tả
Desktop app (Tauri v2) tự động tạo CSV product listing chuẩn Shopify 28 cột.
User nhập sản phẩm + dán Google Drive link → app quét ảnh, matching tự động, xuất CSV.

## Tech Stack
Tauri v2 | React 19 | TypeScript | Tailwind CSS v4 | Zustand | Rust

## Chức năng
1. Tạo Listing: Form nhập → quét Drive → match ảnh → generate CSV
2. Xử lý song song: Nhiều listing chạy đồng thời, hiển thị hàng ngang
3. Lịch sử: Danh sách đã tạo, lọc tháng, tải CSV, xoá

## Data Pattern (từ CSV thực tế)
- 1 product = N variants (ma trận Option1 x Option2, tối đa 3 options)
- Ví dụ: 4 Styles × 8 Players = 32 variants + 2 image-only rows = 34 dòng CSV
- Image Position tăng dần liên tục: 1, 2, 3... 34
- Mỗi variant có cả Image Src (ảnh gallery) VÀ Variant Image (ảnh khi chọn variant)
- Cuối cùng có thể có image-only rows (chỉ Handle + Image Src + Image Position)
