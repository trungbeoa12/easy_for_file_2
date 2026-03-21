# Easy-for-Life (static site)

Landing page tĩnh (HTML/CSS/JS). Mở **`src/pages/index.html`** trong trình duyệt, hoặc dùng file **`index.html`** ở thư mục gốc để chuyển hướng sang **`/pages/index.html`**.

## Cấu trúc thư mục

```
├── index.html                 # Redirect → src/pages/index.html
├── docs/                      # Tài liệu (kế hoạch .odt, …)
├── public/                    # Dành cho bản build / triển khai tĩnh (tuỳ chọn)
└── src/
    ├── assets/
    │   ├── fonts/             # Metropolis, bootstrap-icons
    │   ├── icons/             # PNG feature (hands, heart, …)
    │   └── images/            # Ảnh site (avatar, causes, news, slide, …)
    ├── components/          # Partial / tài liệu component (xem README trong từng thư mục)
    │   ├── common/
    │   ├── layout/
    │   └── sections/
    ├── pages/                 # Các trang HTML
    │   ├── index.html
    │   ├── mvp-registration.html
    │   ├── news.html
    │   └── news-detail.html
    ├── scripts/
    │   ├── vendor/            # jQuery, Bootstrap
    │   ├── nav-section-scroll.js
    │   ├── navbar-sticky.js
    │   ├── site-interactions.js
    │   └── stats-counter.js
    └── styles/
        ├── vendor/            # Bootstrap CSS, bootstrap-icons
        ├── components/
        │   └── product-architecture-section.css   # Kiến trúc sản phẩm + epic-cards
        └── site-theme.css     # Theme gốc (TemplateMo) + đường dẫn assets đã chỉnh
```

## Chạy local (tuỳ chọn)

Cần chạy server từ thư mục **`src/`** để đường dẫn `../styles` và `../assets` từ `pages/` hoạt động:

```bash
cd src && python3 -m http.server 8080
# http://localhost:8080/pages/index.html
```

### Deploy Vercel (site tĩnh)

Repo GitHub chính thức: **[trungbeoa12/easy_for_file_2](https://github.com/trungbeoa12/easy_for_file_2)** — khi kết nối Vercel, chọn đúng repo này (tránh import nhầm repo khác).

`vercel.json`: **Output Directory = `src`**, build no-op (`exit 0`) — khớp đường dẫn trong HTML (`/pages/...`, `/assets/...`). Trang chủ: rewrite `/` → `/pages/index.html`.

Trên Vercel Dashboard: **Framework Preset = Other**; **Output Directory** = `src` nếu dashboard không lấy từ `vercel.json`.

**Lưu ý:** `npm start` / API MongoDB **không** chạy kiểu server dài trên Vercel chỉ với cấu hình này; production API cần Serverless Functions hoặc host riêng (Railway, Render, …).

### API Node (MongoDB Atlas)

1. Sao chép `.env.example` → `.env`, dán `MONGODB_URI` từ Atlas (chuỗi `mongodb+srv://...`).
2. Thêm **`JWT_SECRET`** (chuỗi ngẫu nhiên ≥ 16 ký tự) — bắt buộc cho đăng ký / đăng nhập.
3. `npm install` (lần đầu), rồi `npm start` — **http://localhost:3000** mở thẳng site (redirect tới `/pages/index.html`). Kiểm tra API: **http://localhost:3000/api/health** (text xác nhận backend).

**Auth API (Phase 4 MVP)**

- `POST /api/auth/register` — `{ email, password, displayName?, fullName? }` → `{ data: { token, user } }`.
- `POST /api/auth/login` — `{ email, password }` → `{ data: { token, user } }`.
- `GET /api/auth/me` — header `Authorization: Bearer <token>` → profile user (không có mật khẩu).
- `POST /api/auth/logout` — stateless; client xóa token trong `localStorage`.

**MVP registration API**

- `POST /api/mvp-registrations` — tạo bản ghi; có Bearer token thì gắn **`userId`** và đồng bộ **email theo tài khoản**; không token vẫn gửi khách (chỉ `email` trên form).
- `GET /api/mvp-registrations/me` — **cần đăng nhập** — trả assessment **mới nhất** của user + `history` / `progress` (cùng shape gần với GET theo `id`).
- `GET /api/mvp-registrations/:id` — lấy một bản ghi theo id (public link như trước).

**Dashboard:** `dashboard.html?id=...` → API theo id; **đã đăng nhập và không có `id`** → `GET /api/mvp-registrations/me`; không thì `localStorage` `eflLatestAssessment`. Trang **`login.html`**, **`register.html`**. Trên `localhost:3000`, `app-config.js` dùng API cùng origin; deploy tĩnh (Vercel) cần `API_BASE_URL` + `CORS_ORIGIN` trên Railway gồm domain Vercel.

Hoặc mở trực tiếp file `src/pages/index.html` (file://) — trình duyệt vẫn resolve đường dẫn tương đối đúng.

## Import / đường dẫn (ví dụ)

Từ `src/pages/index.html`:

```html
<link href="../styles/site-theme.css" rel="stylesheet">
<link href="../styles/components/product-architecture-section.css" rel="stylesheet">
<script src="../scripts/site-interactions.js"></script>
<img src="../assets/images/logo-main.png" alt="">
<img src="../assets/icons/icon-life-score.png" alt="">
```

## Đổi tên chính

| Trước        | Sau                      |
|-------------|---------------------------|
| `donate.html` | `mvp-registration.html` |
| `templatemo-kind-heart-charity.css` | `site-theme.css` |
| `efl-product-architecture.css` | `product-architecture-section.css` |
| `custom.js` | `site-interactions.js` |
| `click-scroll.js` | `nav-section-scroll.js` |
| `counter.js` | `stats-counter.js` |
| `jquery.sticky.js` | `navbar-sticky.js` |
