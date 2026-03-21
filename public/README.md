# `public/` (tuỳ chọn)

Khi triển khai (GitHub Pages, Netlify, …), có thể:

1. Đặt **document root** trỏ tới `src/pages` và alias static assets tới `src/assets`, `src/styles`, `src/scripts`, **hoặc**
2. Copy nội dung `src/pages`, `src/assets`, `src/styles`, `src/scripts` vào `public/` (hoặc root host) với cùng cấu trúc tương đối.

Giữ đường dẫn tương đối `../styles/`, `../assets/` từ các file trong `pages/`.
