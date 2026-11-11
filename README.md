# Screw Jam 3D (web build)

Game xếp ốc vít 3D, chạy trên trình duyệt (điện thoại và máy tính). Giao diện tiếng Anh cho thị trường Mỹ.

## Chạy game
Mở `index.html` bằng Chrome. File `lib/three.min.js` (Three.js r128) nằm cùng thư mục nên **chơi được khi không có mạng**.
Font Fredoka tải từ Google Fonts khi có mạng, nếu không có thì dùng font hệ thống (vẫn đẹp, chỉ khác kiểu chữ).

## Cấu trúc
- `index.html`: toàn bộ game (HTML, CSS, JS). Phần "LEVELS" ở đầu file là code thuần JS (dữ liệu màn, bộ giải, sinh màn), không phụ thuộc Three.js.
- `lib/three.min.js`: thư viện 3D.
- `STORE-LISTING.md`: tiêu đề, mô tả, từ khóa, ý tưởng ảnh chụp cho Google Play / App Store (tiếng Anh).
- `manifest.webmanifest`, `sw.js`, `icons/`: PWA. Trên điện thoại mở trang rồi chọn **Add to Home Screen** để cài như app, chơi offline.
- `legal/privacy-policy.html` (đã điền email liên hệ), `STORE-COMPLIANCE.md` (khai báo Data safety, xếp hạng, quảng cáo), `ANDROID-BUILD.md` (đóng gói Capacitor).
- `store-assets/`: icon 512x512 và 4 ảnh chụp cửa hàng 1080x1920 (`screenshot-1..4.png`), feature graphic 1024x500 (`feature-graphic-1024x500.png`), tạo bằng `tools/store-assets.js` rồi `tools/store-assets.py`.
- `tools/`: công cụ kiểm thử và tạo kho bố cục / ảnh cửa hàng (cần Node 22+, Python 3 với Pillow, và Chrome).

## Luật chơi và cách game được kiểm tra
- Một thanh còn >= 2 ốc: đứng yên. Còn 1 ốc: đung đưa như con lắc quanh ốc đó (tối đa khoảng 52°). Hết ốc: rơi.
- Ốc bị che nếu có thanh ở tầng cao hơn nằm đè lên vị trí của nó.
- Ốc cùng màu với hộp hiện tại bay vào hộp, màu khác vào lỗ chờ. Hộp đủ 3 ốc thì bay đi, ốc cùng màu ở lỗ chờ tự vào hộp mới.
- Hint: bộ giải chỉ ốc nên tháo. Hammer (búa): tháo bất kỳ ốc nào kể cả ốc bị che; 1 búa miễn phí mỗi màn, các lần sau phải xem quảng cáo.
- **Menu chính** (mở khi vào game, và bằng nút ☰ trong game): Play (màn kế tiếp), Daily Challenge, Levels, How to Play, bật/tắt âm thanh, Resume khi đang chơi dở.
- **Sao**: 3 sao = không dùng trợ giúp (Hint, Hammer, quảng cáo), 2 sao = một trợ giúp, 1 sao = nhiều hơn hoặc có xem quảng cáo. Sao tốt nhất của mỗi màn được lưu.
- **Levels**: danh sách mọi màn đã mở kèm sao, bấm để chơi lại. Chơi lại màn cũ không đổi chuỗi thắng và không mở màn mới.
- **Chuỗi thắng**: thắng liên tiếp các màn MỚI mà không thua. Cứ 3 trận thắng được +1 Hammer thưởng (dùng ở bất kỳ màn nào). Thua mà bỏ cuộc (Try Again / Menu) hoặc chơi lại màn mới sau khi đã tháo ốc thì mất chuỗi; xem quảng cáo +1 lỗ để giữ chuỗi.
- **Thử thách hàng ngày**: một màn khó (cần đủ 3 lỗ chờ), sinh theo ngày nên ai chơi cũng cùng một màn trong ngày. Thắng lần đầu trong ngày: +1 Hammer và tăng chuỗi ngày; bỏ một ngày thì chuỗi về 1. Chơi lại cùng ngày không nhận thưởng lần hai.
- **Hướng dẫn tự mở rộng**: danh sách `GUIDE` trong `index.html` là nguồn duy nhất của mục How to Play. **Khi thêm tính năng mới chỉ cần thêm một mục vào `GUIDE`**: mục đó tự hiện trong How to Play kèm nhãn NEW, và người chơi cũ thấy ghi chú "New:" ở menu cho tới khi họ mở hướng dẫn. Lần đầu dùng Hint hoặc Hammer game cũng hiện lời nhắc ngắn.
- Dữ liệu người chơi (màn, sao, chuỗi, ngày đã chơi, âm thanh) lưu trong localStorage khóa `sj3d-save`.
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

Thêm `node menu-test.js` (46 kiểm tra: menu, hướng dẫn, sao, chuỗi thắng, thử thách ngày, danh sách màn, lưu tiến độ) và `node pwa-test.js` (chạy máy chủ cục bộ, kiểm tra service worker, cache và tải lại khi tắt mạng).

Kết quả lần kiểm thử gần nhất: xem phần cuối báo cáo trong lần phát hành; tất cả bộ kiểm thử (`menu-test`, `scenarios`, `pwa-test`, `check-levels`, `autoplay`) đều đạt, không có lỗi JavaScript.

## Việc chưa làm (cần làm trước khi phát hành lên cửa hàng)
- **Bạn phải làm:** mở tài khoản AdMob và Google Play; chọn Application ID vĩnh viễn.
- Thay quảng cáo demo bằng AdMob thật: lớp `Ads` đã sẵn sàng nhưng **chưa thử trên thiết bị** (xem `ANDROID-BUILD.md`).
- Build app Android bằng Capacitor và thử trên điện thoại cấu hình thấp thật (máy này chưa có JDK nên tôi chưa build được).
- Chưa thử cảm ứng, rung, âm thanh trên điện thoại thật.
- Icon và ảnh cửa hàng là bản đầu do tôi dựng; nên xem lại hoặc nhờ người thiết kế.
- Chưa có: Undo, bánh xe may mắn, xu, skin, thông báo đẩy.
- Nội dung: 34 bố cục x lật gương x đổi màu, đủ cho vài trăm màn nhưng vẫn cùng một kiểu chơi (chồng thanh nghiêng). Muốn kéo dài cần cơ chế mới (thanh xích, bom đếm ngược, ốc bị khóa...).
