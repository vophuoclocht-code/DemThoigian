## Chấm Giờ là gì?

Ứng dụng ghi lại thời gian bạn ở một địa điểm. Bạn chỉ cần chạm hai lần: lúc đến và lúc về. Ứng dụng lưu hai mốc giờ đó rồi lấy giờ kết thúc trừ giờ bắt đầu để ra thời gian bạn đã ở. Không có đồng hồ chạy ngầm nên không tốn pin.

### Cách dùng hằng ngày

1. Mở ứng dụng, chọn địa điểm ở hàng trên cùng.
2. Khi đến nơi, chạm nút **Bắt đầu**. Ứng dụng lưu giờ hiện tại.
3. Khi về, chạm nút **Kết thúc**. Ứng dụng hiện tổng thời gian bạn đã ở.
4. Bấm **Hoàn tác** ở thông báo phía dưới (trong 10 giây) nếu bạn chạm nhầm.

Khi đang ghi giờ, màn hình hiển thị giờ bắt đầu và thời gian đã qua. Con số "đã qua" chỉ được tính lại khi bạn mở app hoặc chạm **Cập nhật**, đó là cách app tiết kiệm pin. Bạn có thể tắt app hoặc khóa máy thoải mái, giờ bắt đầu vẫn được giữ.

### Quên bấm Kết thúc thì sao?

- Nếu phiên chạy quá số giờ đặt trong Cài đặt (mặc định 12 giờ), trang chủ sẽ hiện cảnh báo.
- Chạm **Chọn giờ kết thúc** để nhập giờ thật bạn đã về.
- Hoặc vào tab **Lịch sử**, chạm vào phiên để sửa giờ bắt đầu, giờ kết thúc và ghi chú.
- Quên bấm cả hai? Dùng **Thêm phiên thủ công** ở tab Lịch sử.

### Các tab

- **Chấm giờ:** nút bắt đầu và kết thúc, thời gian hôm nay và tháng này.
- **Lịch sử:** xem từng phiên theo tháng, lọc theo địa điểm, sửa hoặc xóa.
- **Tổng kết:** tổng giờ cả tháng, so sánh với tháng trước, số ngày có mặt, biểu đồ theo ngày và thống kê theo từng địa điểm. Sang tháng mới, trang chủ sẽ báo tổng kết tháng trước đã sẵn sàng.
- **Cài đặt:** quản lý địa điểm, giao diện sáng tối, sao lưu dữ liệu và cập nhật app.

### Quản lý địa điểm

- Vào **Cài đặt**, chọn **Thêm địa điểm**, nhập tên và chọn màu.
- Có thể đặt **mục tiêu giờ mỗi tháng** để xem tiến độ ở tab Tổng kết.
- Chạm vào một địa điểm để sửa hoặc xóa. Xóa địa điểm sẽ xóa cả các phiên đã ghi tại đó.

### Sao lưu dữ liệu (rất nên làm)

Dữ liệu chỉ nằm trong điện thoại. Nếu bạn xóa dữ liệu trình duyệt hoặc đổi máy, dữ liệu sẽ mất.

1. Vào **Cài đặt**, chọn **Xuất file JSON** mỗi tháng một lần.
2. Chuyển file đó sang Google Drive hoặc gửi cho chính bạn.
3. Khi cần khôi phục, chọn **Nhập từ file JSON**.
4. Dùng **Xuất file CSV** nếu muốn mở bằng Excel hoặc Google Sheets.

### Đưa ứng dụng lên GitHub Pages

1. Tạo kho (repo) mới trên GitHub, chế độ Public.
2. Chọn **Add file**, rồi **Upload files**, tải lên tất cả các file của ứng dụng: `index.html`, `style.css`, `app.js`, `manifest.webmanifest`, `service-worker.js`, `HUONG-DAN.md` và 3 file icon.
3. Vào **Settings**, chọn **Pages**, đặt nhánh `main`, thư mục `/ (root)`, rồi bấm Save.
4. Chờ 1 đến 2 phút rồi mở đường dẫn `https://tên-bạn.github.io/tên-repo/`.

### Cài vào Redmi Note 15

1. Mở đường dẫn bằng Chrome khi có mạng.
2. Bấm **Cài đặt** ở thẻ gợi ý trên trang chủ, hoặc mở menu ⋮ và chọn **Thêm vào màn hình chính**.
3. Mở ứng dụng từ màn hình chính. Từ lần này app chạy được cả khi không có mạng.
4. Để thử, bật chế độ máy bay rồi mở lại app.

Để máy không tắt app ngầm: vào Cài đặt của máy, mục Ứng dụng, chọn Chrome, đặt **Tiết kiệm pin** thành **Không hạn chế** và bật **Tự khởi động**.

### Cập nhật ứng dụng khi sửa file

1. Tải đè các file đã sửa lên GitHub.
2. Mở `service-worker.js` và đổi số phiên bản, ví dụ `chamgio-v3` thành `chamgio-v4`. Bước này bắt buộc để điện thoại nhận bản mới.
3. Mở app khi có mạng, vào **Cài đặt** và chạm **Kiểm tra cập nhật**. App sẽ tự tải lại.
4. Nếu icon trên màn hình chính vẫn cũ, gỡ app rồi cài lại. Dữ liệu vẫn còn khi bạn dùng lại đúng đường dẫn cũ, nhưng hãy sao lưu trước cho chắc.

### Đổi màu giao diện

Mở `style.css`, sửa các dòng đầu file: `--pri` là màu chính, `--acc` là màu của nút Kết thúc. Sau đó nhớ đổi số phiên bản như phần trên.

### Câu hỏi thường gặp

- **Vì sao đồng hồ không chạy từng giây?** Để tiết kiệm pin. App chỉ lưu giờ bắt đầu và giờ kết thúc rồi tính hiệu số.
- **Phiên qua nửa đêm có bị sai không?** Không. Khi tổng kết, giờ được chia đúng cho từng ngày và từng tháng.
- **Đổi múi giờ có ảnh hưởng không?** Các mốc giờ lưu theo thời gian thực của máy nên tổng thời gian luôn đúng.
- **Có cần mạng không?** Chỉ cần mạng lần đầu để cài và khi cập nhật. Dùng hằng ngày không cần mạng.
