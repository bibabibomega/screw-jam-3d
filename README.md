# Screw Jam 3D (web build)

Game xếp ốc vít 3D, chạy trên trình duyệt (điện thoại và máy tính). Giao diện tiếng Anh cho thị trường Mỹ.

## Chạy game
Mở `index.html` bằng Chrome. File `lib/three.min.js` (Three.js r128) nằm cùng thư mục nên **chơi được khi không có mạng**.
Font Fredoka tải từ Google Fonts khi có mạng, nếu không có thì dùng font hệ thống (vẫn đẹp, chỉ khác kiểu chữ).

## Cấu trúc
- `index.html`: toàn bộ game (HTML, CSS, JS). Phần "LEVELS" ở đầu file là code thuần JS (dữ liệu màn, bộ giải, sinh màn), không phụ thuộc Three.js.
- `lib/three.min.js`: thư viện 3D.
- `STORE-LISTING.md`: tiêu đề, mô tả, từ khóa, ý tưởng ảnh chụp cho Google Play / App Store (tiếng Anh).
- `store-assets/`: icon 512x512 và 4 ảnh chụp cửa hàng 1080x1920 (`screenshot-1..4.png`), tạo bằng `tools/store-assets.js` rồi `tools/store-assets.py`.
- `tools/`: công cụ kiểm thử và tạo kho bố cục / ảnh cửa hàng (cần Node 22+, Python 3 với Pillow, và Chrome).

## Luật chơi và cách game được kiểm tra
- Một thanh còn >= 2 ốc: đứng yên. Còn 1 ốc: đung đưa như con lắc quanh ốc đó (tối đa khoảng 52°). Hết ốc: rơi.
- Ốc bị che nếu có thanh ở tầng cao hơn nằm đè lên vị trí của nó.
- Ốc cùng màu với hộp hiện tại bay vào hộp, màu khác vào lỗ chờ. Hộp đủ 3 ốc thì bay đi, ốc cùng màu ở lỗ chờ tự vào hộp mới.
- Thua khi lỗ chờ đầy và không còn ốc đúng màu hộp nào lấy được. Có nút xem quảng cáo (hiện đang giả lập 3 giây) để +1 lỗ.
- Level 1-4 làm tay (dễ, dễ, vừa, khó). Từ level 5 game chọn bố cục từ **kho 34 bố cục sinh sẵn** (`LAYOUT_BANK`, tạo bằng `tools/gen-bank.js`, mỗi bố cục đã qua luật hình học), lật gương ngẫu nhiên,
  gán màu và thứ tự hộp theo số màn, rồi **kiểm tra bằng bộ giải rằng màn đó giải được** với đúng số lỗ chờ yêu cầu (chu kỳ 1, 1, 2, 3).
- Mỗi màu có ký hiệu riêng trên đầu ốc và trong hộp (đỏ dấu cộng, xanh dương dấu trừ, vàng tam giác, xanh lá chấm tròn, tím hình thoi) để người mù màu vẫn chơi được.
- Bộ giải tính theo tư thế cuối cùng của thanh treo, nên thanh đang đung đưa không làm game báo thua oan.

## Kiểm thử
Trong thư mục `tools/` (sửa đường dẫn `F:/CLAUDE AI/...` nếu bạn chuyển thư mục):
- `node check-levels.js`: kiểm tra hình học màn, độ khó và 40 màn sinh tự động.
- `node autoplay.js "file:///.../index.html?auto=20&start=0" 420 "" "<regex>"`: mở Chrome thật, game **tự chơi** 20 màn bằng chạm thật
  (raycaster), theo lời giải. Kết quả đọc từ tiêu đề trang. Đặt `FULL=1` để in đủ.
- `node scenarios.js 480x900 <thư mục ảnh>`: kiểm thử thua, xem quảng cáo, +1 lỗ, gợi ý, chơi lại, lưu tiến độ và chụp ảnh ở cỡ màn hình tùy chọn.

Các công cụ kiểm thử cần thêm `?debug=1` vào URL để bật các hàm kiểm thử (`window.__sj`); bản người chơi thường không có.

Kết quả lần kiểm thử gần nhất: 70/70 màn liên tiếp (màn 1-70) tự chơi thắng bằng chạm thật, 13/13 tình huống đạt (gồm kiểm tra rò rỉ bộ nhớ qua 40 màn: số geometry GPU không tăng), 100/100 màn sinh tự động đúng độ khó (mỗi màn tạo dưới 30 ms), không có lỗi JavaScript, tải được khi tắt mạng.

## Việc chưa làm (cần làm trước khi phát hành lên cửa hàng)
- Thay quảng cáo giả lập bằng SDK thật (AdMob) và dùng quảng cáo thử khi phát triển.
- Chính sách quyền riêng tư (URL), khai báo Data safety, xếp hạng nội dung.
- Đóng gói thành app (ví dụ Capacitor) và thử trên điện thoại cấu hình thấp thật.
- Icon và ảnh cửa hàng hiện là bản đầu tiên do tôi dựng, bạn nên xem lại và có thể nhờ người thiết kế làm bản cuối. Cửa hàng cũng cần ảnh chụp ngang cho máy tính bảng nếu bạn muốn.
- Nội dung: 34 bố cục x lật gương x đổi màu, đủ nhiều cho vài trăm màn nhưng vẫn cùng một kiểu chơi (chồng thanh nghiêng). Muốn kéo dài cần thêm cơ chế mới (thanh xích, bom đếm ngược, ốc bị khóa...).
- Chưa có: Undo, búa gỡ, bánh xe may mắn, xu, skin. Chưa nghe thử âm thanh trên thiết bị thật, chưa thử cảm ứng và rung trên điện thoại thật.
