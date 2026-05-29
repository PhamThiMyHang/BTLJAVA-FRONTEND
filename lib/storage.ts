import {
  Product,
  Service,
  Pet,
  Order,
  ServiceBooking,
  mockProducts,
  mockServices,
  mockPets,
  mockOrders,
  mockServiceBookings,
} from './mock-data';

const PRODUCTS_KEY = 'petshop_products';
const SERVICES_KEY = 'petshop_services';
const PETS_KEY = 'petshop_pets';
const ORDERS_KEY = 'petshop_orders';
const BOOKINGS_KEY = 'petshop_bookings';
const CART_KEY = 'petshop_cart';

// Initialize all data
export function initializeStorage() {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mockProducts));
  }
  if (!localStorage.getItem(SERVICES_KEY)) {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(mockServices));
  }
  if (!localStorage.getItem(PETS_KEY)) {
    localStorage.setItem(PETS_KEY, JSON.stringify(mockPets));
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(mockOrders));
  }
  if (!localStorage.getItem(BOOKINGS_KEY)) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(mockServiceBookings));
  }
}

// ===== Products =====
export function getProducts(): Product[] {
  if (typeof window === 'undefined') return mockProducts;
  const stored = localStorage.getItem(PRODUCTS_KEY);
  return stored ? JSON.parse(stored) : mockProducts;
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return getProducts().filter(p => p.category === category);
}

// ===== Services =====
export function getServices(): Service[] {
  if (typeof window === 'undefined') return mockServices;
  const stored = localStorage.getItem(SERVICES_KEY);
  return stored ? JSON.parse(stored) : mockServices;
}

export function getServiceById(id: string): Service | undefined {
  return getServices().find(s => s.id === id);
}

export function getServicesByCategory(category: string): Service[] {
  return getServices().filter(s => s.category === category);
}

// ===== Pets =====
export function getPets(): Pet[] {
  if (typeof window === 'undefined') return mockPets;
  const stored = localStorage.getItem(PETS_KEY);
  return stored ? JSON.parse(stored) : mockPets;
}

export function getPetsByOwner(ownerId: string): Pet[] {
  return getPets().filter(p => p.ownerId === ownerId);
}

export function getPetById(id: string): Pet | undefined {
  return getPets().find(p => p.id === id);
}

export function addPet(pet: Omit<Pet, 'id'>): Pet {
  const newPet: Pet = {
    ...pet,
    id: 'pet-' + Date.now(),
  };
  
  const pets = getPets();
  const updated = [...pets, newPet];
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(PETS_KEY, JSON.stringify(updated));
  }
  
  return newPet;
}

// ===== Orders =====
export function getOrders(): Order[] {
  if (typeof window === 'undefined') return mockOrders;
  const stored = localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : mockOrders;
}

export function getOrdersByCustomer(customerId: string): Order[] {
  return getOrders().filter(o => o.customerId === customerId);
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find(o => o.id === id);
}

export function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
  const newOrder: Order = {
    ...order,
    id: 'order-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  
  const orders = getOrders();
  const updated = [...orders, newOrder];
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  }
  
  return newOrder;
}

export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);
  
  if (index === -1) return null;
  
  orders[index] = { ...orders[index], ...updates };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
  
  return orders[index];
}

// ===== Service Bookings =====
export function getServiceBookings(): ServiceBooking[] {
  if (typeof window === 'undefined') return mockServiceBookings;
  const stored = localStorage.getItem(BOOKINGS_KEY);
  return stored ? JSON.parse(stored) : mockServiceBookings;
}

export function getBookingsByCustomer(customerId: string): ServiceBooking[] {
  return getServiceBookings().filter(b => b.customerId === customerId);
}

export function getBookingsByKTV(ktvId: string): ServiceBooking[] {
  return getServiceBookings().filter(b => b.assignedKTV === ktvId);
}

export function getBookingById(id: string): ServiceBooking | undefined {
  return getServiceBookings().find(b => b.id === id);
}

export function createBooking(booking: Omit<ServiceBooking, 'id' | 'createdAt'>): ServiceBooking {
  const newBooking: ServiceBooking = {
    ...booking,
    id: 'booking-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  
  const bookings = getServiceBookings();
  const updated = [...bookings, newBooking];
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  }
  
  return newBooking;
}

export function updateBooking(id: string, updates: Partial<ServiceBooking>): ServiceBooking | null {
  const bookings = getServiceBookings();
  const index = bookings.findIndex(b => b.id === id);
  
  if (index === -1) return null;
  
  bookings[index] = { ...bookings[index], ...updates };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }
  
  return bookings[index];
}

// ===== Shopping Cart =====
export interface CartItem {
  productId: string;
  quantity: number;
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addToCart(productId: string, quantity: number = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.productId === productId);
  
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
}

export function removeFromCart(productId: string) {
  const cart = getCart().filter(item => item.productId !== productId);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
}

export function clearCart() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CART_KEY);
  }
}

export function getCartTotal(): number {
  const cart = getCart();
  const products = getProducts();
  
  return cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}
