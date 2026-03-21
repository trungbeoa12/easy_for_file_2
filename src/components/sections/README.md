# Sections (partial / mapping)

Trang tĩnh không có bundler: markup đầy đủ nằm trong `src/pages/index.html`. Bảng ánh xạ section → id → file style liên quan:

| Khu vực UI              | `id` / vị trí        | CSS / ghi chú |
|-------------------------|----------------------|----------------|
| Hero / slider           | `#hero-slide`        | `site-theme.css` (HERO & HERO SLIDE) |
| Feature blocks (4 ô)   | sau hero             | `site-theme.css` (FEATURE BLOCK) |
| Giới thiệu / tầm nhìn   | `#section_2`         | `site-theme.css` |
| **Kiến trúc / EPIC**    | `#section_3`         | `styles/components/product-architecture-section.css` (`.product-architecture-section`, `.epic-cards`, `.epic-card`) |
| MVP / form              | `#section_4`         | `site-theme.css` (volunteer-section) |
| Tin tức                 | `#section_5`         | `site-theme.css` |
| Liên hệ                 | `#section_6`         | `site-theme.css` |

Đặt file partial `.html` tại đây nếu sau này dùng SSI / build step — hiện không include tự động.
