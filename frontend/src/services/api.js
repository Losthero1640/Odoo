// Mock API service for demonstration
const API_BASE = '/api';

// Mock data storage
let mockUsers = [
  {
    id: 1,
    email: 'admin@swapplatform.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    points: 1000,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'user123',
    name: 'John Doe',
    role: 'user',
    points: 150,
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100'
  }
];

let mockItems = [
  {
    id: 1,
    title: 'Vintage Denim Jacket',
    description: 'Classic vintage denim jacket in excellent condition. Perfect for layering and casual wear. Size M, fits true to size.',
    category: 'Outerwear',
    type: 'Jackets',
    size: 'M',
    condition: 'Excellent',
    tags: ['vintage', 'denim', 'casual', 'layering'],
    images: [
      'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=500',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500'
    ],
    uploader: {
      id: 2,
      name: 'John Doe',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    status: 'available',
    approved: true,
    createdAt: '2024-01-15T10:30:00Z',
    points: 50
  },
  {
    id: 2,
    title: 'Designer Summer Dress',
    description: 'Beautiful floral summer dress from a premium brand. Worn only twice, perfect for special occasions or casual summer days.',
    category: 'Dresses',
    type: 'Summer Dresses',
    size: 'S',
    condition: 'Good',
    tags: ['designer', 'floral', 'summer', 'occasions'],
    images: [
      'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=500'
    ],
    uploader: {
      id: 2,
      name: 'John Doe',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    status: 'available',
    approved: true,
    createdAt: '2024-01-10T14:20:00Z',
    points: 75
  },
  {
    id: 3,
    title: 'Professional Blazer',
    description: 'Navy blue professional blazer, perfect for office wear or business meetings. High-quality fabric, barely worn.',
    category: 'Formal Wear',
    type: 'Blazers',
    size: 'L',
    condition: 'New',
    tags: ['professional', 'navy', 'office', 'business'],
    images: [
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=500'
    ],
    uploader: {
      id: 1,
      name: 'Admin User',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    status: 'pending',
    approved: false,
    createdAt: '2024-01-12T09:15:00Z',
    points: 100
  }
];

let mockSwaps = [
  {
    id: 1,
    itemId: 1,
    requesterId: 2,
    status: 'pending',
    createdAt: '2024-01-16T11:00:00Z',
    message: 'Love this jacket! I have a vintage sweater I could exchange for it.'
  }
];

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authAPI = {
  async login(email, password) {
    await delay(500);
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }
    throw new Error('Invalid credentials');
  },

  async signup(userData) {
    await delay(500);
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }
    
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      role: 'user',
      points: 100,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100'
    };
    
    mockUsers.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    return { success: true, user: userWithoutPassword };
  },

  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem('currentUser');
  }
};

export const itemsAPI = {
  async getItems(filters = {}) {
    await delay(300);
    let items = mockItems.filter(item => item.approved);
    
    if (filters.category && filters.category !== 'all') {
      items = items.filter(item => item.category.toLowerCase() === filters.category.toLowerCase());
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    return items;
  },

  async getItem(id) {
    await delay(300);
    const item = mockItems.find(item => item.id === parseInt(id));
    if (!item) throw new Error('Item not found');
    return item;
  },

  async createItem(itemData) {
    await delay(500);
    const newItem = {
      id: mockItems.length + 1,
      ...itemData,
      uploader: authAPI.getCurrentUser(),
      status: 'available',
      approved: false,
      createdAt: new Date().toISOString(),
      points: parseInt(itemData.points) || 50
    };
    
    mockItems.push(newItem);
    return newItem;
  },

  async getUserItems(userId) {
    await delay(300);
    return mockItems.filter(item => item.uploader.id === userId);
  },

  async getFeaturedItems() {
    await delay(300);
    return mockItems.filter(item => item.approved).slice(0, 6);
  }
};

export const adminAPI = {
  async getPendingItems() {
    await delay(300);
    return mockItems.filter(item => !item.approved);
  },

  async approveItem(itemId) {
    await delay(300);
    const item = mockItems.find(item => item.id === itemId);
    if (item) {
      item.approved = true;
      return item;
    }
    throw new Error('Item not found');
  },

  async rejectItem(itemId) {
    await delay(300);
    mockItems = mockItems.filter(item => item.id !== itemId);
    return true;
  }
};

export const swapsAPI = {
  async getUserSwaps(userId) {
    await delay(300);
    return mockSwaps.filter(swap => swap.requesterId === userId);
  },

  async createSwap(swapData) {
    await delay(300);
    const newSwap = {
      id: mockSwaps.length + 1,
      ...swapData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    mockSwaps.push(newSwap);
    return newSwap;
  }
};

export const CATEGORIES = [
  'Tops',
  'Bottoms', 
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
  'Formal Wear',
  'Activewear'
];

export const ITEM_TYPES = {
  Tops: ['T-Shirts', 'Blouses', 'Sweaters', 'Hoodies', 'Tank Tops'],
  Bottoms: ['Jeans', 'Trousers', 'Shorts', 'Skirts', 'Leggings'],
  Dresses: ['Casual Dresses', 'Formal Dresses', 'Summer Dresses', 'Maxi Dresses'],
  Outerwear: ['Jackets', 'Coats', 'Blazers', 'Cardigans', 'Vests'],
  Shoes: ['Sneakers', 'Boots', 'Heels', 'Flats', 'Sandals'],
  Accessories: ['Bags', 'Belts', 'Scarves', 'Jewelry', 'Hats'],
  'Formal Wear': ['Suits', 'Blazers', 'Dress Shirts', 'Formal Dresses'],
  Activewear: ['Workout Tops', 'Yoga Pants', 'Sports Bras', 'Athletic Shorts']
};

export const CONDITIONS = ['New', 'Excellent', 'Good', 'Fair'];
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];