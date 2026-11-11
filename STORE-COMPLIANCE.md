# Hồ sơ tuân thủ cửa hàng (Google Play / App Store)

Đây là bản **chuẩn bị sẵn**, không phải tư vấn pháp lý. Biểu mẫu của cửa hàng đổi thường xuyên, hãy đối chiếu lại khi điền thật.
Các câu trả lời bên dưới dựa trên đúng những gì game làm hôm nay (bản demo chưa có quảng cáo thật). Khi gắn AdMob thật, dùng cột "Khi có AdMob".

## 1. Chính sách quyền riêng tư (bắt buộc khi có quảng cáo)
- File nháp: `legal/privacy-policy.html` (tiếng Anh). **Bạn cần điền** `[DEVELOPER NAME]` và `[CONTACT EMAIL]`, rồi xóa khung vàng.
  Tôi cố ý không điền email của bạn vì trang sẽ công khai trên mạng.
- Sau khi điền, đưa lên một URL công khai (ví dụ `https://bibabibomega.github.io/screw-jam-3d/legal/privacy-policy.html`)
  và dán URL đó vào Play Console / App Store Connect.
- Game đã bỏ Google Fonts (font nằm trong `lib/fonts`) nên không còn gửi IP người chơi cho Google qua font.

## 2. Google Play: Data safety
| Câu hỏi | Bản demo hiện tại | Khi có AdMob |
|---|---|---|
| App có thu thập hoặc chia sẻ dữ liệu người dùng? | Không | Có |
| Dữ liệu thu thập | Không có | Device or other IDs (Advertising ID); thông tin tương tác quảng cáo và chẩn đoán do AdMob thu thập |
| Mục đích | - | Advertising or marketing; Analytics (theo khai báo AdMob) |
| Chia sẻ với bên thứ ba | Không | Có (Google AdMob) |
| Dữ liệu được mã hóa khi truyền | - | Có |
| Người dùng có thể yêu cầu xóa | Dữ liệu chỉ nằm trên máy, gỡ app là xóa | Như trái, cộng thêm đặt lại Advertising ID |

Hãy đọc hướng dẫn khai báo của Google dành cho AdMob ở thời điểm phát hành để chọn đúng danh mục.

## 3. Đối tượng và xếp hạng nội dung
- Target audience: chọn **13+ hoặc 18+**, không chọn nhóm có trẻ em (<13) trừ khi bạn sẵn sàng theo chính sách Families (SDK quảng cáo được chứng nhận, v.v.).
- Bảng câu hỏi IARC (Google Play) / Age Rating (Apple): game không có bạo lực, máu, nội dung người lớn, cờ bạc, chất cấm, chat hay nội dung người dùng tạo ra.
  Có quảng cáo: trả lời "Có". Hiện chưa có giao dịch tiền thật (nếu sau này bán gói bỏ quảng cáo thì khai báo mua trong ứng dụng).
- Kết quả thường là xếp hạng thấp nhất (Everyone / 4+ hoặc 9+ tùy nền tảng), nhưng đây do hệ thống tính.

## 4. Quảng cáo
- Play Console: bật "Ứng dụng này có chứa quảng cáo".
- Game chỉ dùng **quảng cáo thưởng tự nguyện** (người chơi bấm mới xem). Không có quảng cáo chèn ngang, không chặn màn hình bất ngờ. Giữ nguyên nguyên tắc này để tránh vi phạm chính sách quảng cáo gây khó chịu.
- Lớp quảng cáo trong `index.html` (`Ads.showRewarded`) đã sẵn sàng: tự dùng AdMob khi chạy trong app Capacitor có plugin `@capacitor-community/admob`, ngược lại dùng bản demo.
  ID đang là **ID quảng cáo thử của Google**. Khi phát hành phải đổi `AD_CONFIG` thành ID thật. **Phần AdMob chưa được thử trên thiết bị thật.**
- Các bước AdMob: tạo tài khoản AdMob, tạo app Android/iOS, tạo ad unit dạng Rewarded, thay ID trong `AD_CONFIG` và `APPLICATION_ID` trong AndroidManifest, thêm `app-ads.txt` lên website nhà phát triển.
- Người chơi ở EEA/UK cần hộp thoại đồng ý (Google UMP). Một số bang Mỹ có thể cần tùy chọn từ chối quảng cáo cá nhân hóa. Plugin AdMob hỗ trợ UMP, hãy bật khi phát hành.

## 5. App Store (nếu làm iOS)
- App Privacy: bản demo "Data Not Collected"; có AdMob thì khai báo Identifiers (Device ID) và Usage Data dùng cho Third-Party Advertising.
- iOS 14.5+: cần App Tracking Transparency nếu quảng cáo dùng IDFA.
- Cần tài khoản Apple Developer (99 USD/năm) và máy Mac để build.

## 6. Giấy phép thành phần
- Three.js (MIT): giấy phép nằm trong đầu file `lib/three.min.js`.
- Font Fredoka (SIL OFL 1.1): ghi chú trong `lib/fonts/LICENSE.txt`.
