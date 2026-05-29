# 🐾 PetShop - Hệ thống quản lý cửa hàng thú cưng

Một ứng dụng web đầy đủ chức năng để quản lý cửa hàng thú cưng, bao gồm bán sản phẩm, dịch vụ grooming/spa, và khách sạn thú cưng.

## 📋 Tính năng chính

### 🌐 Website công khai
- **Trang chủ**: Hiển thị sản phẩm nổi bật và dịch vụ
- **Danh sách sản phẩm**: Lọc theo danh mục, xem chi tiết sản phẩm
- **Danh sách dịch vụ**: Các dịch vụ grooming, spa, khách sạn, healthcare
- **Giỏ hàng**: Thêm/xóa sản phẩm, thanh toán
- **Quản lý thú cưng**: Hướng dẫn chăm sóc thú cưng
- **Về chúng tôi**: Thông tin về cửa hàng

### 👥 Hệ thống tài khoản
- **Đăng nhập / Đăng ký**: Tạo tài khoản khách hàng
- **4 vai trò**: Admin, Staff, KTV (Kỹ thuật viên), Customer

### 👨‍💼 Admin Dashboard
- Xem thống kê tổng quan (đơn hàng, dịch vụ, người dùng)
- Quản lý người dùng (Admin, Staff, KTV, Customer)
- Quản lý sản phẩm
- Quản lý dịch vụ
- Theo dõi doanh thu

### 📦 Staff Dashboard
- Quản lý đơn hàng (cập nhật trạng thái: pending → confirmed → shipping → delivered)
- Xem danh sách đơn hàng
- Theo dõi doanh thu bán hàng

### 💇 KTV Dashboard
- Xem danh sách dịch vụ được giao
- Cập nhật trạng thái dịch vụ (pending → confirmed → in-progress → completed)
- Theo dõi lịch làm việc
- Xem doanh thu

### 👤 Customer Dashboard
- Quản lý thú cưng của mình (thêm/xóa/chỉnh sửa)
- Xem lịch sử đơn hàng
- Xem danh sách dịch vụ đã đặt
- Cài đặt tài khoản (đổi mật khẩu, cập nhật thông tin)
- Đặt dịch vụ (chọn thú cưng, ngày giờ, ghi chú)

## 🛍️ Danh mục sản phẩm
- Thức ăn
- Đồ chơi
- Chuồng
- Vệ sinh
- Phụ kiện

## 🎯 Danh mục dịch vụ
- **Grooming** (Tắm rửa & Cắt tỉa lông)
- **Spa** (Spa toàn thân)
- **Hotel** (Khách sạn thú cưng)
- **Healthcare** (Kiểm tra sức khỏe & Tiêm phòng)
- **Training** (Đào tạo)

## 🔐 Tài khoản Demo

### Admin
- Email: `admin@petshop.com`
- Password: `admin123`

### Staff
- Email: `staff@petshop.com`
- Password: `staff123`

### KTV
- Email: `ktv@petshop.com`
- Password: `ktv123`

### Customer
- Email: `customer@example.com`
- Password: `customer123`

## 🚀 Cách sử dụng

### Khách hàng
1. Truy cập trang chủ
2. Duyệt sản phẩm hoặc dịch vụ
3. Thêm sản phẩm vào giỏ hàng
4. Đăng ký/Đăng nhập để thanh toán
5. Chọn địa chỉ giao và phương thức thanh toán
6. Xác nhận đơn hàng
7. Truy cập Customer Dashboard để xem lịch sử và đặt dịch vụ

### Admin
1. Đăng nhập với tài khoản admin
2. Xem thống kê toàn bộ hệ thống
3. Quản lý người dùng, sản phẩm, dịch vụ

### Staff
1. Đăng nhập với tài khoản staff
2. Xem danh sách đơn hàng
3. Cập nhật trạng thái đơn hàng

### KTV
1. Đăng nhập với tài khoản KTV
2. Xem danh sách dịch vụ được giao
3. Cập nhật trạng thái dịch vụ

## 📦 Công nghệ sử dụng

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: localStorage
- **Icons**: lucide-react

## 📂 Cấu trúc thư mục

```
app/
├── page.tsx                 # Trang chủ
├── products/               # Sản phẩm
│   └── [id]/page.tsx       # Chi tiết sản phẩm
├── services/               # Dịch vụ
│   └── [id]/page.tsx       # Chi tiết dịch vụ
├── cart/page.tsx           # Giỏ hàng
├── pets/page.tsx           # Hướng dẫn thú cưng
├── about/page.tsx          # Về chúng tôi
├── login/page.tsx          # Đăng nhập
├── register/page.tsx       # Đăng ký
├── admin/page.tsx          # Admin Dashboard
├── staff/page.tsx          # Staff Dashboard
├── ktv/page.tsx            # KTV Dashboard
└── customer/               # Customer Dashboard
    ├── page.tsx
    ├── orders/page.tsx     # Xem đơn hàng
    ├── bookings/page.tsx   # Xem dịch vụ đặt
    ├── pets/page.tsx       # Quản lý thú cưng
    └── settings/page.tsx   # Cài đặt

components/
├── header.tsx              # Navigation header
├── footer.tsx              # Footer

lib/
├── mock-data.ts            # Dữ liệu demo
├── auth.ts                 # Hàm xác thực
└── storage.ts              # Hàm lưu trữ dữ liệu
```

## ✨ Tính năng nổi bật

1. **Giao diện thân thiện**: Thiết kế modern, dễ sử dụng
2. **Responsive**: Hoạt động trên desktop, tablet, mobile
3. **Multi-role**: 4 vai trò khác nhau với quyền hạn khác nhau
4. **Real-time Status**: Cập nhật trạng thái đơn hàng/dịch vụ
5. **Danh sách thú cưng**: Quản lý thông tin thú cưng cá nhân
6. **Giỏ hàng**: Lưu và cập nhật giỏ hàng
7. **Lịch sử giao dịch**: Xem tất cả đơn hàng và dịch vụ

## 🔄 Quy trình đặt hàng

1. Khách hàng chọn sản phẩm → Thêm vào giỏ hàng
2. Xem giỏ hàng → Nhập địa chỉ giao → Chọn phương thức thanh toán
3. Xác nhận đơn hàng (Trạng thái: Pending)
4. Staff xác nhận đơn hàng (Trạng thái: Confirmed)
5. Staff cập nhật sang đang vận chuyển (Trạng thái: Shipping)
6. Staff cập nhật đã giao (Trạng thái: Delivered)

## 🎯 Quy trình đặt dịch vụ

1. Khách hàng xem danh sách dịch vụ
2. Chọn dịch vụ → Chọn thú cưng → Chọn ngày/giờ → Ghi chú
3. Xác nhận đặt dịch vụ (Trạng thái: Pending)
4. KTV thấy dịch vụ được giao → Xác nhận (Trạng thái: Confirmed)
5. KTV bắt đầu thực hiện (Trạng thái: In-progress)
6. KTV hoàn thành (Trạng thái: Completed)

## 💾 Lưu ý về dữ liệu

- Dữ liệu được lưu trong **localStorage** (chỉ trên browser)
- Không sử dụng database thực - dành cho demo/học tập
- Dữ liệu sẽ bị xóa nếu xóa cache/localStorage

## 🚀 Bắt đầu

1. Clone repository
2. Cài đặt dependencies: `pnpm install`
3. Chạy dev server: `pnpm dev`
4. Mở browser: `http://localhost:3000`

## 📝 Ghi chú

- Tất cả dữ liệu là mock data cho mục đích demo
- Có thể dễ dàng kết nối với API thực hoặc database
- Cấu trúc code sạch và dễ bảo trì

---

**Phiên bản**: 1.0.0
**Ngôn ngữ**: Tiếng Việt
**Năm phát triển**: 2024
