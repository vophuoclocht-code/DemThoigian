# Chấm Giờ - ghi chú cho người làm web

File này dành cho bạn khi cần đưa app lên mạng hoặc chỉnh sửa. Người dùng app xem hướng dẫn ở Cài đặt, mục Hướng dẫn sử dụng (file HUONG-DAN.md).

## Các file

- index.html, style.css, app.js: giao diện và logic
- manifest.webmanifest, service-worker.js, icon-*.png: để cài vào màn hình chính và chạy offline
- HUONG-DAN.md: hướng dẫn sử dụng hiển thị trong app

## Đưa lên GitHub Pages

1. Tạo repo mới trên GitHub, chế độ Public.
2. Add file, Upload files, tải lên tất cả các file trong thư mục này.
3. Settings, Pages, chọn nhánh main, thư mục / (root), Save.
4. Chờ 1 đến 2 phút rồi mở https://tên-bạn.github.io/tên-repo/

## Cập nhật khi sửa file

1. Tải đè các file đã sửa lên GitHub.
2. Mở service-worker.js, đổi số phiên bản (ví dụ chamgio-v4 thành chamgio-v5). Bắt buộc, nếu không điện thoại giữ bản cũ.
3. Mở app khi có mạng, vào Cài đặt, chạm Kiểm tra cập nhật.
4. Icon trên màn hình chính không tự đổi: gỡ app rồi cài lại (hãy sao lưu JSON trước).

## Đổi màu

Sửa các biến ở đầu style.css: --pri là màu chính, --acc là màu nút Kết thúc. Màu địa điểm nằm ở mảng COLORS đầu app.js.
