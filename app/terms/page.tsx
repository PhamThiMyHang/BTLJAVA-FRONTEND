import Header from '@/components/header';
import Footer from '@/components/footer';
import { FileText, UserCheck, CreditCard, RotateCcw, Shield, AlertTriangle, RefreshCw } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <FileText className="w-16 h-16 text-orange-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Điều khoản sử dụng</h1>
          </div>

          <div className="prose prose-lg text-gray-700 leading-relaxed max-w-none space-y-12">
            
            <div className="bg-white rounded-3xl shadow-sm p-10 border border-orange-100">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-orange-600" /> 1. Chấp nhận điều khoản
              </h2>
              <p className="text-lg">
                Khi truy cập và sử dụng website PetShop, bạn đồng ý tuân thủ và bị ràng buộc bởi các Điều khoản Sử dụng này. 
                Nếu bạn không đồng ý, vui lòng không sử dụng dịch vụ của chúng tôi.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-orange-600" /> 2. Tài khoản người dùng
              </h2>
              <ul className="space-y-4 text-lg">
                {[
                  "Bạn phải cung cấp thông tin chính xác, đầy đủ khi đăng ký.",
                  "Bạn chịu trách nhiệm bảo mật tài khoản và mật khẩu của mình.",
                  "PetShop không chịu trách nhiệm cho bất kỳ tổn thất nào do bạn tiết lộ thông tin tài khoản."
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-1">✓</div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-10">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-orange-600" /> 3. Đặt hàng và thanh toán
              </h2>
              <p className="text-lg leading-relaxed">
                Tất cả đơn hàng chỉ được xác nhận khi chúng tôi nhận được thanh toán đầy đủ. 
                Chúng tôi có quyền từ chối hoặc hủy đơn hàng trong trường hợp phát hiện gian lận hoặc thông tin không chính xác.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <RotateCcw className="w-8 h-8 text-orange-600" /> 4. Chính sách hoàn tiền và đổi trả
              </h2>
              <p className="text-lg leading-relaxed bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                Sản phẩm lỗi hoặc hỏng do vận chuyển sẽ được đổi trả trong vòng 7 ngày. 
                Dịch vụ đã thực hiện không được hoàn tiền trừ trường hợp lỗi từ phía PetShop.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-orange-600" /> 5. Trách nhiệm của người dùng
              </h2>
              <p className="text-lg">
                Bạn cam kết không sử dụng website để thực hiện các hành vi vi phạm pháp luật, 
                gây hại, hoặc ảnh hưởng đến quyền lợi của PetShop và các bên thứ ba.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-orange-600" /> 6. Giới hạn trách nhiệm
              </h2>
              <p className="text-lg">
                PetShop không chịu trách nhiệm cho bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc hậu quả nào 
                phát sinh từ việc sử dụng website.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-10">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <RefreshCw className="w-8 h-8 text-orange-600" /> 7. Thay đổi điều khoản
              </h2>
              <p className="text-lg">
                Chúng tôi có quyền cập nhật Điều khoản Sử dụng bất kỳ lúc nào. 
                Việc bạn tiếp tục sử dụng website sau khi thay đổi nghĩa là bạn chấp nhận các điều khoản mới.
              </p>
            </div>

            {/* Important Notice */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-3xl p-10 text-center">
              <p className="text-xl font-medium">
                Bằng việc sử dụng dịch vụ của PetShop, bạn đã đọc, hiểu và đồng ý với toàn bộ 
                <span className="font-bold"> Điều khoản Sử dụng</span> và 
                <span className="font-bold"> Chính sách Bảo mật</span>.
              </p>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}