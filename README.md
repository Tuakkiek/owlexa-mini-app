# Owlexa Student Mini App

Zalo Mini App dành cho học viên của hệ thống Owlexa.

Ứng dụng này tập trung vào trải nghiệm student-only trên mobile, giúp học viên theo dõi lịch học, điểm danh, học phí, bài tập, tài liệu và hồ sơ cá nhân ngay trong Zalo.

## Tính năng hiện có

- Đăng nhập và xác thực role `STUDENT`
- Trang chủ dashboard với:
  - thông tin học viên
  - lịch học sắp tới
  - học phí cần thanh toán
  - bài tập cần chú ý
  - tài liệu mới được chia sẻ
- Lịch học theo tuần
- Điểm danh theo lớp và theo ngày
- Học phí và thanh toán QR
- Danh sách bài tập được giao
- Bắt đầu / tiếp tục lượt làm bài
- Làm bài cơ bản cho:
  - câu hỏi trắc nghiệm
  - câu hỏi tự luận
- Thư viện tài liệu học tập
- Hồ sơ cá nhân và đăng xuất

## Tech Stack

- React 18
- TypeScript
- Vite
- Zalo Mini App SDK (`zmp-sdk`)
- ZaUI (`zmp-ui`)
- Jotai
- Axios
- Tailwind CSS
- Sass

## Yêu cầu

- Node.js 18+
- npm
- Zalo Mini App CLI hoặc Zalo Mini App VS Code Extension

## Cài đặt

```bash
npm install
```

## Chạy local

### Cách 1: dùng Zalo Mini App CLI

```bash
npm run start
```

Sau đó mở preview theo flow của Zalo Mini App CLI.

### Cách 2: dùng VS Code Extension

1. Cài `Zalo Mini App Extension`
1. Mở thư mục `owlexa-mini-app`
1. Cấu hình App ID trong extension
1. Cài dependencies
1. Start từ tab Run của extension

## Build production

```bash
npm run build
```

Output build nằm trong thư mục `www/`.

## Deploy

Đăng nhập Zalo Mini App CLI:

```bash
npm run login
```

Deploy:

```bash
npm run deploy
```

## Cấu hình môi trường

Ứng dụng dùng `VITE_API_URL` để trỏ tới backend.

Trong production, biến này là bắt buộc.

Ví dụ:

```bash
VITE_API_URL=https://your-api-domain.com
```

Nếu không truyền `VITE_API_URL`, app sẽ fallback về:

```text
http://localhost:8081
```

## Điều hướng chính

- `/login`
- `/`
- `/schedule`
- `/attendance`
- `/assignments`
- `/assignments/attempt/:attemptId`
- `/documents`
- `/fees`
- `/profile`

## Cấu trúc thư mục chính

```text
src/
  components/
    content/
    navigation/
  core/
    api/
    auth/
    storage/
    utils/
  features/
    assignments/
    attendance/
    auth/
    documents/
    fees/
    home/
    profile/
    schedule/
    submission/
  layouts/
  router/
```

## Ghi chú

- App hiện được thiết kế riêng cho học viên, không hỗ trợ teacher/owner/cashier flow.
- Nội dung bài làm hiện đã hỗ trợ render rich content cơ bản và làm bài cho `MULTIPLE_CHOICE` + `ESSAY`.
- Một số block nâng cao như audio/table/file preview có thể tiếp tục mở rộng ở các bước sau.

## Scripts

```bash
npm run start
npm run build
npm run login
npm run deploy
```
