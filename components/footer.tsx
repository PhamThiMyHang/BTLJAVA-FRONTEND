import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">PetShop</h3>
            <p className="text-sm">
              Cửa hàng thú cưng hàng đầu, cung cấp sản phẩm chất lượng cao và dịch vụ chuyên nghiệp.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=Thức ăn" className="hover:text-orange-600">
                  Thức ăn
                </Link>
              </li>
              <li>
                <Link href="/products?category=Đồ chơi" className="hover:text-orange-600">
                  Đồ chơi
                </Link>
              </li>
              <li>
                <Link href="/products?category=Chuồng" className="hover:text-orange-600">
                  Chuồng
                </Link>
              </li>
              <li>
                <Link href="/products?category=Vệ sinh" className="hover:text-orange-600">
                  Vệ sinh
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services#grooming" className="hover:text-orange-600">
                  Grooming
                </Link>
              </li>
              <li>
                <Link href="/services#spa" className="hover:text-orange-600">
                  Spa
                </Link>
              </li>
              <li>
                <Link href="/services#hotel" className="hover:text-orange-600">
                  Khách sạn thú cưng
                </Link>
              </li>
              <li>
                <Link href="/services#healthcare" className="hover:text-orange-600">
                  Chăm sóc sức khỏe
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm">
              <li>Địa chỉ: 123 Nguyễn Huệ, Quận 1, HCM</li>
              <li>Điện thoại: <a href="tel:0901234567" className="hover:text-orange-600">0901234567</a></li>
              <li>Email: <a href="mailto:info@petshop.com" className="hover:text-orange-600">info@petshop.com</a></li>
              <li>Giờ mở cửa: 8:00 - 21:00</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; 2026 PetShop. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-orange-600">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="hover:text-orange-600">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
