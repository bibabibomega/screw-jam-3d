# Đóng gói thành app Android (Capacitor)

**Tôi chưa build thử được trên máy này**: máy chưa có JDK, và tôi không có thiết bị Android để thử. Phần khung (`package.json`, `capacitor.config.json`,
`scripts/build-www.js`) đã sẵn; `build-www.js` đã chạy thành công và tạo ra thư mục `www/` đúng các file cần thiết. Các bước dưới đây là quy trình chuẩn của Capacitor.

## Chuẩn bị (một lần)
1. Cài **Android Studio** (đã gồm JDK 17+ và Android SDK) và Node.js 22+.
2. Chọn **Application ID** vĩnh viễn, dạng tên miền đảo ngược, ví dụ `us.wisepicks.screwjam3d`, rồi sửa `appId` trong `capacitor.config.json`.
   Không đổi được sau khi đã phát hành trên Google Play.
3. Trong thư mục dự án, chạy:
   ```
   npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor-community/admob
   npx cap add android
   ```

## Mỗi lần build
```
npm run sync        # copy game vào www/ rồi đồng bộ vào dự án Android
npx cap open android
```
Trong Android Studio: chạy thử trên điện thoại thật (bật USB debugging) hoặc máy ảo.

## Gắn quảng cáo AdMob
1. Trong `android/app/src/main/AndroidManifest.xml`, thêm bên trong thẻ `<application>`:
   ```xml
   <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-3940256099942544~3347511713"/>
   ```
   (đây là ID **thử** của Google, thay bằng ID app thật của bạn khi phát hành).
2. Trong `index.html`, đối tượng `AD_CONFIG` đang chứa ID quảng cáo thưởng **thử** của Google. Thay bằng ad unit thật khi phát hành.
3. Khi app chạy trong Capacitor có plugin AdMob, game tự dùng quảng cáo thật; trên web vẫn dùng bản demo đếm ngược.
4. Phần tích hợp này **chưa được kiểm tra trên thiết bị**. Tên hàm của plugin có thể khác theo phiên bản, hãy đối chiếu tài liệu của `@capacitor-community/admob`.

## Phát hành lên Google Play
1. Tạo keystore ký app (giữ file này và mật khẩu an toàn, mất là không cập nhật được app).
2. Android Studio: Build > Generate Signed Bundle (AAB).
3. Điền Play Console theo `STORE-COMPLIANCE.md`, nội dung mô tả trong `STORE-LISTING.md`, ảnh trong `store-assets/`
   (icon 512, feature graphic 1024x500, ảnh chụp điện thoại).
4. Google yêu cầu tài khoản nhà phát triển (phí một lần 25 USD) và, với tài khoản cá nhân mới, thử nghiệm kín với đủ số người trong một khoảng thời gian trước khi lên bản chính thức. Hãy kiểm tra yêu cầu hiện hành trên Play Console.
