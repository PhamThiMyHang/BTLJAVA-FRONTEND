export interface User {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'staff' | 'ktv' | 'admin';
  address?: string;
  avatar?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  name: string;
  type: string; // dog, cat, etc.
  breed: string;
  age: number;
  weight: number;
  ownerId: string;
  description?: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  description: string;
  rating: number;
}

export interface Service {
  id: string;
  name: string;
  category: 'grooming' | 'spa' | 'hotel' | 'training' | 'healthcare';
  price: number;
  duration: number; // in minutes
  description: string;
  image?: string;
  rating: number;
}

export interface Order {
  id: string;
  customerId: string;
  products: Array<{ productId: string; quantity: number; price: number }>;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryDate?: string;
  paymentMethod: string;
  address: string;
}

export interface ServiceBooking {
  id: string;
  customerId: string;
  petId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  price: number;
  assignedKTV?: string;
  createdAt: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@petshop.com',
    phone: '0901234567',
    password: 'admin123',
    role: 'admin',
    address: '123 Nguyễn Huệ, HCM',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'staff-1',
    name: 'Nhân viên bán hàng',
    email: 'staff@petshop.com',
    phone: '0902345678',
    password: 'staff123',
    role: 'staff',
    address: '123 Nguyễn Huệ, HCM',
    createdAt: new Date('2024-01-05').toISOString(),
  },
  {
    id: 'ktv-1',
    name: 'Kỹ thuật viên Grooming',
    email: 'ktv@petshop.com',
    phone: '0903456789',
    password: 'ktv123',
    role: 'ktv',
    address: '123 Nguyễn Huệ, HCM',
    createdAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: 'customer-1',
    name: 'Nguyễn Văn A',
    email: 'customer@example.com',
    phone: '0904567890',
    password: 'customer123',
    role: 'customer',
    address: '456 Lê Lợi, HCM',
    createdAt: new Date('2024-02-01').toISOString(),
  },
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Thức ăn chó cao cấp',
    category: 'Thức ăn',
    price: 450000,
    stock: 50,
    description: 'Thức ăn chó hoàn chỉnh, giàu dinh dưỡng, tốt cho sức khỏe',
    rating: 4.8,
    image: '/images/dog-food.jpg',
  },
  {
    id: 'prod-2',
    name: 'Đồ chơi cho mèo',
    category: 'Đồ chơi',
    price: 150000,
    stock: 30,
    description: 'Đồ chơi an toàn, kích thích vận động của mèo',
    rating: 4.5,
    image: '/images/cat-toy.jpg',
  },
  {
    id: 'prod-3',
    name: 'Chuồng chó chất lượng cao',
    category: 'Chuồng',
    price: 2500000,
    stock: 10,
    description: 'Chuồng được thiết kế thoáng mát, chắc chắn',
    rating: 4.7,
    image: '/images/dog-cage.jpg',
  },
  {
    id: 'prod-4',
    name: 'Dung cụ vệ sinh cho thú cưng',
    category: 'Vệ sinh',
    price: 320000,
    stock: 25,
    description: 'Bộ dụng cụ lau sạch, chăm sóc lông',
    rating: 4.6,
    image: '/images/grooming-kit.jpg',
  },
  {
    id: 'prod-5',
    name: 'Collar thời trang cho chó',
    category: 'Phụ kiện',
    price: 280000,
    stock: 40,
    description: 'Collar bền, thoải mái, nhiều màu sắc',
    rating: 4.4,
    image: '/images/collar.jpg',
  },
];

// Mock Services
export const mockServices: Service[] = [
  {
    id: 'svc-1',
    name: 'Tắm rửa & làm sạch',
    category: 'grooming',
    price: 400000,
    duration: 60,
    description: 'Tắm rửa chuyên nghiệp với sản phẩm cao cấp',
    rating: 4.9,
    image: '/images/grooming.jpg',
  },
  {
    id: 'svc-2',
    name: 'Cắt tỉa lông',
    category: 'grooming',
    price: 600000,
    duration: 90,
    description: 'Cắt tỉa lông theo xu hướng, tạo hình thẩm mỹ',
    rating: 4.8,
    image: '/images/hair-cut.jpg',
  },
  {
    id: 'svc-3',
    name: 'Spa toàn thân',
    category: 'spa',
    price: 800000,
    duration: 120,
    description: 'Spa thư giãn với các liệu pháp chăm sóc cao cấp',
    rating: 4.9,
    image: '/images/spa.jpg',
  },
  {
    id: 'svc-4',
    name: 'Khách sạn thú cưng',
    category: 'hotel',
    price: 250000,
    duration: 1440, // 24 hours
    description: 'Chỗ ở thoải mái, được chăm sóc 24/7',
    rating: 4.7,
    image: '/images/hotel.jpg',
  },
  {
    id: 'svc-5',
    name: 'Tiêm phòng & khám sức khỏe',
    category: 'healthcare',
    price: 350000,
    duration: 45,
    description: 'Kiểm tra sức khỏe toàn diện, tiêm chủng',
    rating: 4.8,
    image: '/images/health.jpg',
  },
];

// Mock Pets (for customers)
export const mockPets: Pet[] = [
  {
    id: 'pet-1',
    name: 'Milo',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 28,
    ownerId: 'customer-1',
    description: 'Chó vàng thân thiện, yêu chơi',
    image: '/images/golden.jpg',
  },
  {
    id: 'pet-2',
    name: 'Luna',
    type: 'cat',
    breed: 'Persian',
    age: 2,
    weight: 4,
    ownerId: 'customer-1',
    description: 'Mèo Ba Tư xinh đẹp, dễ mến',
    image: '/images/persian.jpg',
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    customerId: 'customer-1',
    products: [
      { productId: 'prod-1', quantity: 2, price: 450000 },
      { productId: 'prod-4', quantity: 1, price: 320000 },
    ],
    totalPrice: 1220000,
    status: 'delivered',
    createdAt: new Date('2024-03-01').toISOString(),
    deliveryDate: new Date('2024-03-05').toISOString(),
    paymentMethod: 'credit_card',
    address: '456 Lê Lợi, HCM',
  },
];

// Mock Service Bookings
export const mockServiceBookings: ServiceBooking[] = [
  {
    id: 'booking-1',
    customerId: 'customer-1',
    petId: 'pet-1',
    serviceId: 'svc-1',
    date: '2024-03-20',
    time: '10:00',
    status: 'confirmed',
    notes: 'Chó cần tắm rửa sạch',
    price: 400000,
    assignedKTV: 'ktv-1',
    createdAt: new Date('2024-03-15').toISOString(),
  },
];
