import Header from '@/components/header';
import Footer from '@/components/footer';
import { Shield, Eye, Lock, Users, Phone, Mail } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Shield className="w-16 h-16 text-orange-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Chính sách bảo mật</h1>
          </div>

          <div className="prose prose-lg text-gray-700 leading-relaxed max-w-none">
            <div className="bg-white rounded-3xl shadow-sm p-10 mb-10 border border-orange-100">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-orange-600" /> 1. Giới thiệu
              </h2>
              <p className="text-lg">
                PetShop tôn trọng và cam kết bảo vệ quyền riêng tư của khách hàng. 
                Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, 
                tiết lộ và bảo vệ thông tin cá nhân của bạn.
              </p>
            </div>

            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">2. Thông tin chúng tôi thu thập</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    "Họ tên, email, số điện thoại, địa chỉ giao hàng",
                    "Thông tin thú cưng: Tên, giống loài, tuổi, sức khỏe",
                    "Lịch sử đơn hàng và phương thức thanh toán",
                    "Thông tin tự động: IP, trình duyệt, thời gian truy cập"
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">3. Mục đích sử dụng thông tin</h2>
                <ul className="space-y-4">
                  {[
                    "Xử lý đơn hàng và cung cấp dịch vụ",
                    "Gửi thông báo, xác nhận đơn hàng",
                    "Cải thiện trải nghiệm người dùng",
                    "Phân tích hành vi sử dụng website",
                    "Tuân thủ quy định pháp luật"
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-3xl p-10">
                <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <Lock className="w-8 h-8 text-orange-600" /> 4. Bảo mật thông tin
                </h2>
                <p className="text-lg leading-relaxed">
                  Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức cao nhất 
                  để bảo vệ thông tin cá nhân của bạn. Tuy nhiên, không có hệ thống nào là an toàn tuyệt đối.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">5. Quyền của bạn</h2>
                <ul className="list-disc pl-6 space-y-3 text-lg">
                  <li>Truy cập và nhận bản sao thông tin cá nhân của mình</li>
                  <li>Yêu cầu chỉnh sửa hoặc xóa thông tin</li>
                  <li>Rút lại sự đồng ý xử lý dữ liệu</li>
                  <li>Khiếu nại về cách chúng tôi xử lý dữ liệu</li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="mt-16 bg-white rounded-3xl p-10 shadow-sm border">
              <h2 className="text-3xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
                <Phone className="w-8 h-8 text-orange-600" /> Liên hệ với chúng tôi
              </h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <Mail className="w-8 h-8 mx-auto mb-3 text-orange-600" />
                  <p className="font-medium">support@petshop.com</p>
                </div>
                <div>
                  <Phone className="w-8 h-8 mx-auto mb-3 text-orange-600" />
                  <p className="font-medium">0901 234 567</p>
                </div>
                <div>
                  <p className="font-medium">123 Nguyễn Huệ, Quận 1<br />TP. Hồ Chí Minh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}