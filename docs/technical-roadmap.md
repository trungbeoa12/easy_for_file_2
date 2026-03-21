# Easy-for-Life Technical Roadmap

Tai lieu nay chuyen roadmap san pham hien co thanh ke hoach ky thuat co the implement truc tiep trong repo hien tai.

## 1. Hien trang codebase

### Frontend

- Landing page tinh bang HTML/CSS/JS tai `src/pages/`.
- Trang MVP registration da co giao dien nhung chua co luong gui du lieu that.
- News va news detail dang dong vai tro truyen thong roadmap, chua lay tu backend.

### Backend

- `server.js` moi co:
  - static file serving
  - redirect `/` -> `/pages/index.html`
  - `GET /api/health`
  - ket noi MongoDB bang `mongoose.connect(...)`
- Chua co:
  - model/schema
  - API CRUD nghiep vu
  - validation request
  - submit form
  - rule engine BMI/TDEE
  - dashboard data API
  - test

### Ket luan

De bat dau lam tinh nang, can di theo huong:

1. Dung backend MVP that cho thu thap du lieu.
2. Them tinh toan suc khoe co ban.
3. Tao response/result view cho nguoi dung.
4. Sau do moi mo rong dashboard, scoring, daily plan.

## 2. Muc tieu ky thuat theo phase

### Phase 1: Data Capture MVP

Muc tieu:

- Nhan duoc du lieu dang ky MVP tu form.
- Luu du lieu vao MongoDB voi schema ro rang.
- Validate du lieu dau vao.
- Phan hoi thanh cong/that bai ro rang cho frontend.

Ket qua business:

- Co the thu lead that.
- Co tap du lieu dau tien de hieu nhu cau nguoi dung.

### Phase 2: Health Metrics Engine

Muc tieu:

- Tinh BMI.
- Tinh TDEE.
- Rule-based benchmark co ban.
- Tra ket qua tong hop cho user sau khi submit.

Ket qua business:

- MVP khong chi thu lead ma bat dau tao gia tri tuc thi.

### Phase 3: Life Score + Dashboard

Muc tieu:

- Tong hop diem theo nhom chi so.
- Hien breakdown de user biet vi sao diem cao/thap.
- Co dashboard don gian de validate mo hinh san pham.

### Phase 4: Daily Plan Beta

Muc tieu:

- Bien du lieu va benchmark thanh de xuat hanh dong theo ngay.
- Xuat goi y co the thuc hien duoc ngay.

### Phase 5: Ecosystem + Admin + Scale

Muc tieu:

- Quan tri du lieu dang ky.
- Loc nguoi dung MVP.
- Chuan bi tich hop doi tac/gym/meal plan.

## 3. Roadmap chi tiet theo task/file

## Phase 1A. Chuan hoa backend foundation

### Task 1. Tach cau truc server de de mo rong

Muc tieu:

- Khong de tat ca logic trong `server.js`.

File hien co:

- `server.js`

File nen tao:

- `src-backend/app.js`
- `src-backend/config/env.js`
- `src-backend/config/db.js`
- `src-backend/routes/index.js`
- `src-backend/controllers/health.controller.js`

Cong viec:

- Dua phan tao `express()` vao `app.js`.
- Dua logic connect MongoDB vao `config/db.js`.
- Giu `server.js` la diem khoi dong.
- Gom routes API vao `routes/index.js`.

Done when:

- Server van chay nhu cu.
- `GET /api/health` khong bi anh huong.
- Co cau truc de them route moi ma khong lam `server.js` phinh to.

### Task 2. Them middleware co ban

File nen tao:

- `src-backend/middlewares/error-handler.js`
- `src-backend/middlewares/not-found.js`
- `src-backend/middlewares/request-logger.js`

Cong viec:

- Ghi log request co ban.
- Xu ly 404 cho API.
- Xu ly loi thong nhat JSON.

Done when:

- API loi tra ve format on dinh, vi du:
  - `success: false`
  - `message`
  - `errors` neu co

### Task 3. Chuan hoa bien moi truong

File can sua:

- `.env.example`
- `README.md`

Bien nen co them:

- `MONGODB_URI`
- `PORT`
- `CORS_ORIGIN`
- `NODE_ENV`

Done when:

- Moi bien moi truong co mo ta ngan.
- Co huong dan chay local ro hon.

## Phase 1B. MVP registration data pipeline

### Task 4. Dinh nghia schema cho registration

File nen tao:

- `src-backend/models/mvp-registration.model.js`

Schema de xuat:

- `fullName`
- `email`
- `goals` array
- `priority`
- `note`
- `consent`
- `sourcePage`
- `status`
- `createdAt`
- `updatedAt`

Gia tri ho tro:

- `status`: `new`, `reviewed`, `contacted`, `rejected`
- `sourcePage`: `landing`, `mvp-registration`

Done when:

- Co model MongoDB ro rang cho lead MVP.

### Task 5. Tao API submit registration

File nen tao:

- `src-backend/routes/mvp-registration.routes.js`
- `src-backend/controllers/mvp-registration.controller.js`
- `src-backend/services/mvp-registration.service.js`
- `src-backend/validators/mvp-registration.validator.js`

API de xuat:

- `POST /api/mvp-registrations`

Validation can co:

- `fullName` bat buoc
- `email` dung format
- `goals` la array hop le
- `priority` nam trong danh sach cho phep
- `consent` phai bang `true`

Done when:

- Frontend co endpoint that de gui form.
- Du lieu luu duoc vao MongoDB.

### Task 6. Noi form landing page vao API

File can sua:

- `src/pages/index.html`
- `src/scripts/site-interactions.js`

Cong viec:

- Dat `id` cho form tai section MVP.
- Bat su kien submit.
- Doc du lieu tu form.
- Goi `fetch('/api/mvp-registrations')`.
- Hien state:
  - loading
  - success
  - error

Done when:

- Form o landing submit duoc.
- User nhan duoc thong bao ro rang.

### Task 7. Noi form trang dang ky MVP vao API

File can sua:

- `src/pages/mvp-registration.html`
- `src/scripts/site-interactions.js`

Cong viec:

- Tai su dung cung service submit voi landing page.
- Normalize field names de backend nhan mot cau truc thong nhat.
- Hien thong bao thanh cong.

Luu y:

- Hien trang nay van la form 1 buoc.
- Ve sau co the tach thanh form nhieu buoc ma khong doi endpoint.

### Task 8. Them feedback UI cho submit

File can sua:

- `src/styles/site-theme.css`
- `src/scripts/site-interactions.js`

Cong viec:

- Them class cho submit loading.
- Them thong bao inline thanh cong/that bai.
- Disable button trong luc dang gui.

Done when:

- Khong bi submit lap.
- UX duoc ro rang va tin cay hon.

## Phase 1C. Nang cap form thanh multi-step MVP that

### Task 9. Thiet ke bo field MVP Phase 1

Nen gom thanh cac nhom:

1. Thong tin co ban
2. Co the va suc khoe
3. Thoi quen song
4. Muc tieu
5. Cong viec va stress
6. Chi tieu lien quan suc khoe/an uong

File can sua:

- `src/pages/mvp-registration.html`

Field de xuat:

- tuoi
- gioi tinh
- chieu cao
- can nang
- muc do van dong
- gio ngu trung binh
- so buoi tap moi tuan
- muc tieu chinh
- gio lam viec moi ngay
- stress tu danh gia
- ngan sach an uong/suc khoe

### Task 10. Xay multi-step form

File can sua:

- `src/pages/mvp-registration.html`
- `src/styles/site-theme.css`
- `src/scripts/site-interactions.js`

Cong viec:

- Chia form thanh 4-6 buoc.
- Co nut next/back.
- Validate theo tung buoc.
- Co progress indicator.

Done when:

- User co the di tung buoc va submit du lieu day du.

### Task 11. Cap nhat schema registration de chua du lieu phong phu hon

File can sua:

- `src-backend/models/mvp-registration.model.js`
- `src-backend/validators/mvp-registration.validator.js`

Nen nhom field thanh object:

- `profile`
- `bodyMetrics`
- `habits`
- `workContext`
- `goals`
- `finance`

Loi ich:

- De map sang score engine va dashboard sau nay.

## Phase 2A. Metrics engine

### Task 12. Tao utility tinh BMI

File nen tao:

- `src-backend/utils/health/bmi.js`

Output de xuat:

- `bmiValue`
- `bmiCategory`
- `reference`

Rule:

- Theo moc WHO co ban.

### Task 13. Tao utility tinh BMR/TDEE

File nen tao:

- `src-backend/utils/health/tdee.js`

Input:

- gioi tinh
- tuoi
- chieu cao
- can nang
- activityLevel

Output:

- `bmr`
- `tdee`
- `activityMultiplier`

### Task 14. Tao benchmark engine ban dau

File nen tao:

- `src-backend/services/benchmark.service.js`

Danh gia ban dau:

- ngu du/khong du
- van dong du/khong du
- calories uoc tinh
- can nang duoi/chuan/thua
- stress thap/vua/cao

Done when:

- Sau submit co the sinh summary co cau truc.

### Task 15. Tao API tinh ket qua MVP

Lua chon 1:

- Tinh va luu ket qua ngay trong `POST /api/mvp-registrations`

Lua chon 2:

- Tach rieng `POST /api/mvp-assessment`

De xuat:

- Giai doan dau nen tinh ngay trong submit registration de don gian.

File can sua:

- `src-backend/controllers/mvp-registration.controller.js`
- `src-backend/services/mvp-registration.service.js`

Output tra ve:

- registration id
- summary
- bmi
- tdee
- benchmark flags

## Phase 2B. Frontend ket qua MVP

### Task 16. Them khu vuc hien ket qua sau submit

File can sua:

- `src/pages/mvp-registration.html`
- `src/styles/site-theme.css`
- `src/scripts/site-interactions.js`

Cong viec:

- Render ket qua trong trang sau khi submit thanh cong.
- Hien:
  - BMI
  - TDEE
  - nhan xet tong quan
  - 3-5 goi y rule-based

### Task 17. Tao trang result rieng neu can

File nen tao:

- `src/pages/mvp-result.html`
- `src/scripts/mvp-result.js`

Khi nao nen lam:

- Khi muon chia se URL ket qua.
- Khi muon reload khong mat state.

Khuyen nghi:

- Ban dau chua can, co the render inline cho nhanh.

## Phase 3A. Life Score framework

### Task 18. Dinh nghia cong thuc Life Score ban dau

File nen tao:

- `docs/life-score-framework.md`
- `src-backend/services/life-score.service.js`

De xuat nhom diem:

- body
- sleep
- activity
- work-life
- nutrition/energy

Nguyen tac:

- Don gian, giai thich duoc.
- Khong "magic score".

### Task 19. Luu ket qua scoring vao DB

File can sua:

- `src-backend/models/mvp-registration.model.js`

Them field:

- `assessment`
- `lifeScore`
- `recommendations`

### Task 20. Tao API lay ket qua theo id

File nen tao/sua:

- `src-backend/routes/mvp-results.routes.js`
- `src-backend/controllers/mvp-results.controller.js`

API de xuat:

- `GET /api/mvp-registrations/:id`

Dung cho:

- Trang ket qua
- Dashboard
- Admin review

## Phase 3B. Dashboard MVP

### Task 21. Tao dashboard HTML dau tien

File nen tao:

- `src/pages/dashboard.html`
- `src/scripts/dashboard.js`

Muc tieu:

- Hien tong diem
- Breakdown theo nhom
- Hien recommendations

Dashboard MVP co the gom:

- card diem tong
- progress bar tung nhom
- warning cards
- top 3 uu tien can cai thien

### Task 22. Them chart nhe neu can

Lua chon:

- Tu ve bang CSS/HTML
- Hoac them mot thu vien chart nhe

Khuyen nghi:

- MVP dau tien nen dung HTML/CSS thuong de giam phuc tap.

## Phase 4. Daily plan beta

### Task 23. Dinh nghia input cho daily plan

File nen tao:

- `docs/daily-plan-framework.md`

Input can co:

- gio thuc day
- gio ngu
- gio lam viec
- lich tap
- muc tieu uu tien

### Task 24. Tao service generate daily plan don gian

File nen tao:

- `src-backend/services/daily-plan.service.js`

Output:

- morning block
- work block
- meal reminders
- movement breaks
- sleep wind-down

### Task 25. Them UI daily plan

File nen tao/sua:

- `src/pages/dashboard.html`
- `src/styles/site-theme.css`
- `src/scripts/dashboard.js`

## Phase 5. Admin and operations

### Task 26. Tao trang admin noi bo toi thieu

File nen tao:

- `src/pages/admin.html`
- `src/scripts/admin.js`

API can co:

- `GET /api/admin/mvp-registrations`
- `PATCH /api/admin/mvp-registrations/:id/status`

Luu y:

- Giai doan dau co the bao ve bang basic auth hoac secret token don gian.

### Task 27. Export data va tracking

File nen tao:

- `src-backend/services/export.service.js`

Tinh nang:

- loc lead moi
- export CSV
- thong ke source va muc tieu pho bien

## 4. Thu tu implement de xuat

Neu muon ra MVP nhanh nhat, thu tu nen la:

1. Refactor backend foundation
2. Schema + API submit registration
3. Noi 2 form hien tai vao API
4. UI submit feedback
5. Mo rong form thanh multi-step
6. BMI/TDEE engine
7. Benchmark summary
8. Render ket qua sau submit
9. Life Score ban dau
10. Dashboard
11. Daily plan beta
12. Admin/export

## 5. Uoc luong cong viec

Neu lam gon de co MVP that:

- Backend foundation + submit pipeline: 2-3 ngay
- Multi-step form: 2-4 ngay
- BMI/TDEE + benchmark: 2-3 ngay
- Result UI: 1-2 ngay
- Dashboard MVP: 3-5 ngay

Tong:

- 10-17 ngay lam viec cho MVP co gia tri that.

Neu muon chat hon ve validation, tracking, admin:

- cong them 5-8 ngay.

## 6. Rủi ro ky thuat hien tai

### Rủi ro 1. Frontend dang la static pages

Tac dong:

- Logic chia se va tai su dung JS de bi roi neu tiep tuc nhung tat ca vao `site-interactions.js`.

Huong xu ly:

- Tach JS theo page hoac theo feature som.

### Rủi ro 2. Server chua co cau truc module

Tac dong:

- Them tinh nang se nhanh roi vao tinh trang kho bao tri.

Huong xu ly:

- Refactor nhe ngay truoc khi them API nghiep vu.

### Rủi ro 3. Chua co test

Tac dong:

- Rule BMI/TDEE va benchmark de sai ma khong biet.

Huong xu ly:

- It nhat them test cho utils tinh toan.

### Rủi ro 4. Deploy backend production chua ro

Tac dong:

- Vercel hien chi hop phan static site.

Huong xu ly:

- Chon host rieng cho Express API: Railway, Render, VPS.

## 7. Backlog file-level de minh co the lam tiep ngay

### Dot 1

- Sua `server.js`
- Tao `src-backend/app.js`
- Tao `src-backend/config/db.js`
- Tao `src-backend/routes/index.js`
- Tao `src-backend/routes/mvp-registration.routes.js`
- Tao `src-backend/controllers/mvp-registration.controller.js`
- Tao `src-backend/models/mvp-registration.model.js`
- Tao `src-backend/services/mvp-registration.service.js`
- Tao `src-backend/validators/mvp-registration.validator.js`

### Dot 2

- Sua `src/pages/index.html`
- Sua `src/pages/mvp-registration.html`
- Sua `src/scripts/site-interactions.js`
- Sua `src/styles/site-theme.css`

### Dot 3

- Tao `src-backend/utils/health/bmi.js`
- Tao `src-backend/utils/health/tdee.js`
- Tao `src-backend/services/benchmark.service.js`

### Dot 4

- Tao `src/pages/dashboard.html`
- Tao `src/scripts/dashboard.js`

## 8. Khuyen nghi thuc thi

Neu bat dau ngay bay gio, minh khuyen nghi chia thanh 3 moc:

### Moc 1. Co lead pipeline that

- Form gui duoc vao DB
- Co validate
- Co success state

### Moc 2. Co assessment that

- Tinh BMI/TDEE
- Co summary benchmark
- User nhan ket qua ngay

### Moc 3. Co product shell that

- Life Score
- Dashboard
- Daily plan ban dau

## 9. De xuat buoc tiep theo

Buoc hop ly nhat de code ngay trong repo nay la:

1. Implement Dot 1 va Dot 2 de bien form thanh tinh nang that.
2. Sau do them BMI/TDEE engine.

Neu can, minh co the dung tai lieu nay lam checklist va bat tay implement Phase 1 ngay trong repo.
