export const mockUsers = [
  { id: 1, name: "Ahmed Hassan", avatar: "https://i.pravatar.cc/40?img=1", role: "User", userType: "Real", coins: 15420, status: "Active", uniqueId: "TG-001234", gender: "Male", age: 28, country: "Egypt", followers: 1250 },
  { id: 2, name: "Sara Ali", avatar: "https://i.pravatar.cc/40?img=5", role: "VIP", userType: "Real", coins: 89500, status: "Active", uniqueId: "TG-001235", gender: "Female", age: 24, country: "UAE", followers: 5680 },
  { id: 3, name: "Mohamed Khaled", avatar: "https://i.pravatar.cc/40?img=3", role: "Host", userType: "Real", coins: 45200, status: "Active", uniqueId: "TG-001236", gender: "Male", age: 31, country: "Saudi Arabia", followers: 3420 },
  { id: 4, name: "Fatima Nour", avatar: "https://i.pravatar.cc/40?img=9", role: "User", userType: "Real", coins: 2100, status: "Banned", uniqueId: "TG-001237", gender: "Female", age: 22, country: "Morocco", followers: 890 },
  { id: 5, name: "Omar Youssef", avatar: "https://i.pravatar.cc/40?img=8", role: "Admin", userType: "Real", coins: 120000, status: "Active", uniqueId: "TG-001238", gender: "Male", age: 35, country: "Jordan", followers: 12500 },
  { id: 6, name: "Layla Ibrahim", avatar: "https://i.pravatar.cc/40?img=10", role: "VIP", userType: "Real", coins: 67800, status: "Active", uniqueId: "TG-001239", gender: "Female", age: 27, country: "Egypt", followers: 8900 },
  { id: 7, name: "Karim Mansour", avatar: "https://i.pravatar.cc/40?img=11", role: "User", userType: "Bot", coins: 500, status: "Inactive", uniqueId: "TG-001240", gender: "Male", age: 19, country: "Tunisia", followers: 120 },
  { id: 8, name: "Nadia Samir", avatar: "https://i.pravatar.cc/40?img=16", role: "Host", userType: "Real", coins: 34500, status: "Active", uniqueId: "TG-001241", gender: "Female", age: 26, country: "Lebanon", followers: 4500 },
];

export const mockVerifications = [
  { id: 1, user: "Ahmed Hassan", avatar: "https://i.pravatar.cc/40?img=1", uniqueId: "TG-001234", idProof: "National ID", status: "Pending", address: "Cairo, Egypt", applicationDate: "2026-02-10" },
  { id: 2, user: "Sara Ali", avatar: "https://i.pravatar.cc/40?img=5", uniqueId: "TG-001235", idProof: "Passport", status: "Approved", address: "Dubai, UAE", applicationDate: "2026-02-08" },
  { id: 3, user: "Fatima Nour", avatar: "https://i.pravatar.cc/40?img=9", uniqueId: "TG-001237", idProof: "Driver License", status: "Rejected", address: "Casablanca, Morocco", applicationDate: "2026-02-05" },
  { id: 4, user: "Karim Mansour", avatar: "https://i.pravatar.cc/40?img=11", uniqueId: "TG-001240", idProof: "National ID", status: "Pending", address: "Tunis, Tunisia", applicationDate: "2026-02-12" },
];

export const mockHostApplications = [
  { id: 1, user: "Nadia Samir", avatar: "https://i.pravatar.cc/40?img=16", agency: "Star Agency", status: "Pending", applicationDate: "2026-02-11" },
  { id: 2, user: "Layla Ibrahim", avatar: "https://i.pravatar.cc/40?img=10", agency: "Golden Entertainment", status: "Approved", applicationDate: "2026-02-07" },
  { id: 3, user: "Omar Youssef", avatar: "https://i.pravatar.cc/40?img=8", agency: "Prime Hosts", status: "Rejected", applicationDate: "2026-02-03" },
];

export const mockHosts = [
  { id: 1, agency: "Star Agency", name: "Nadia Samir", avatar: "https://i.pravatar.cc/40?img=16", uniqueId: "TG-001241", gender: "Female", age: 26, coins: 34500, country: "Lebanon", followers: 4500, followings: 320, friends: 180 },
  { id: 2, agency: "Golden Entertainment", name: "Mohamed Khaled", avatar: "https://i.pravatar.cc/40?img=3", uniqueId: "TG-001236", gender: "Male", age: 31, coins: 45200, country: "Saudi Arabia", followers: 3420, followings: 150, friends: 95 },
  { id: 3, agency: "Prime Hosts", name: "Layla Ibrahim", avatar: "https://i.pravatar.cc/40?img=10", uniqueId: "TG-001239", gender: "Female", age: 27, coins: 67800, country: "Egypt", followers: 8900, followings: 410, friends: 220 },
  { id: 4, agency: "Star Agency", name: "Sara Ali", avatar: "https://i.pravatar.cc/40?img=5", uniqueId: "TG-001235", gender: "Female", age: 24, coins: 89500, country: "UAE", followers: 5680, followings: 290, friends: 150 },
];

export const mockAgencies = [
  { id: 1, name: "Star Agency", logo: "https://i.pravatar.cc/40?img=30", user: "Admin User", country: "Lebanon", email: "star@agency.com", mobile: "+961 71 123456", commission: 15, hosts: 24, hostEarnings: 125000 },
  { id: 2, name: "Golden Entertainment", logo: "https://i.pravatar.cc/40?img=31", user: "Manager Ali", country: "Saudi Arabia", email: "golden@ent.com", mobile: "+966 50 1234567", commission: 12, hosts: 18, hostEarnings: 98000 },
  { id: 3, name: "Prime Hosts", logo: "https://i.pravatar.cc/40?img=32", user: "Director Sara", country: "Egypt", email: "prime@hosts.com", mobile: "+20 100 1234567", commission: 10, hosts: 35, hostEarnings: 210000 },
];

export const mockCoinTraders = [
  { id: 1, user: "Ahmed Hassan", avatar: "https://i.pravatar.cc/40?img=1", uniqueId: "TG-001234", coinBalance: 15420, spentCoins: 8900, mobile: "+20 100 1234567", createdDate: "2025-12-15", status: "Active" },
  { id: 2, user: "Sara Ali", avatar: "https://i.pravatar.cc/40?img=5", uniqueId: "TG-001235", coinBalance: 89500, spentCoins: 45000, mobile: "+971 50 1234567", createdDate: "2025-11-20", status: "Active" },
  { id: 3, user: "Karim Mansour", avatar: "https://i.pravatar.cc/40?img=11", uniqueId: "TG-001240", coinBalance: 500, spentCoins: 12000, mobile: "+216 20 123456", createdDate: "2026-01-10", status: "Inactive" },
];

export const mockBanners = [
  { id: 1, image: "https://placehold.co/300x150/7c3aed/ffffff?text=Banner+1", redirectUrl: "https://example.com/promo1", status: true, createdDate: "2026-01-15", lastUpdated: "2026-02-10" },
  { id: 2, image: "https://placehold.co/300x150/6d28d9/ffffff?text=Banner+2", redirectUrl: "https://example.com/promo2", status: true, createdDate: "2026-01-20", lastUpdated: "2026-02-08" },
  { id: 3, image: "https://placehold.co/300x150/5b21b6/ffffff?text=Banner+3", redirectUrl: "https://example.com/promo3", status: false, createdDate: "2026-02-01", lastUpdated: "2026-02-05" },
];

export const dashboardStats = {
  totalUsers: 24580,
  vipUsers: 1890,
  totalHosts: 456,
  totalAgencies: 32,
  totalCoins: 15890000,
  activeUsers: 18420,
  newUsersToday: 145,
  revenue: 89500,
};

export const activityData = [
  { name: "Jan", users: 4000, hosts: 240, revenue: 12000 },
  { name: "Feb", users: 5200, hosts: 310, revenue: 15000 },
  { name: "Mar", users: 4800, hosts: 280, revenue: 13500 },
  { name: "Apr", users: 6100, hosts: 350, revenue: 18000 },
  { name: "May", users: 7200, hosts: 420, revenue: 22000 },
  { name: "Jun", users: 6800, hosts: 390, revenue: 20000 },
  { name: "Jul", users: 8100, hosts: 480, revenue: 25000 },
  { name: "Aug", users: 7500, hosts: 440, revenue: 23000 },
  { name: "Sep", users: 9200, hosts: 520, revenue: 28000 },
  { name: "Oct", users: 8800, hosts: 500, revenue: 27000 },
  { name: "Nov", users: 10500, hosts: 580, revenue: 32000 },
  { name: "Dec", users: 11200, hosts: 620, revenue: 35000 },
];

export const topContributors = [
  { name: "Omar Youssef", avatar: "https://i.pravatar.cc/40?img=8", coins: 120000 },
  { name: "Sara Ali", avatar: "https://i.pravatar.cc/40?img=5", coins: 89500 },
  { name: "Layla Ibrahim", avatar: "https://i.pravatar.cc/40?img=10", coins: 67800 },
  { name: "Mohamed Khaled", avatar: "https://i.pravatar.cc/40?img=3", coins: 45200 },
  { name: "Nadia Samir", avatar: "https://i.pravatar.cc/40?img=16", coins: 34500 },
];
