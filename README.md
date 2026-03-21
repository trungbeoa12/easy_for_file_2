# Easy-for-Life (static site)

Landing page tĩnh (HTML/CSS/JS). Mở **`src/pages/index.html`** trong trình duyệt, hoặc dùng file **`index.html`** ở thư mục gốc để chuyển hướng.

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

### API Node (MongoDB Atlas)

1. Sao chép `.env.example` → `.env`, dán `MONGODB_URI` từ Atlas (chuỗi `mongodb+srv://...`).
2. `npm install` (lần đầu), rồi `npm start` — server mặc định **http://localhost:3000** (`GET /` trả về text xác nhận).

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
