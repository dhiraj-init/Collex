export interface MockListing {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 
    | 'Books'
    | 'Electronics'
    | 'Cycles'
    | 'Calculators'
    | 'Lab Equipment'
    | 'Hostel Essentials'
    | 'Furniture'
    | 'Fashion'
    | 'Sports'
    | 'Free Stuff';
  dealType: 'Sell' | 'Rent' | 'Exchange' | 'Free';
  condition: 'Brand New' | 'Like New' | 'Good' | 'Fair';
  photos: string[];
  college: string;
  campusLocation: string;
  postedAt: string;
  viewsCount: number;
  likesCount: number;
  isFeatured?: boolean;
  isReserved?: boolean;
  isSold?: boolean;
  seller: {
    id: string;
    name: string;
    avatar: string;
    college: string;
    branch: string;
    year: string;
    trustScore: number; // out of 100
    rating: number; // out of 5
    reviewCount: number;
    isVerified: boolean;
    joinedDate: string;
  };
}

export interface MockCollege {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  domains: string[];
  studentCount: string;
}

export interface MockReview {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerBranch: string;
  rating: number;
  date: string;
  comment: string;
  itemTitle: string;
}

export interface MockNotification {
  id: string;
  type: 'offer' | 'message' | 'system' | 'meetup';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  link?: string;
}

export interface MockMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isMe: boolean;
}

export interface MockConversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string;
  partnerName: string;
  partnerAvatar: string;
  partnerCollege: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: MockMessage[];
}

export const MOCK_COLLEGES: MockCollege[] = [
  {
    id: 'iit-bombay',
    name: 'Indian Institute of Technology Bombay',
    shortName: 'IIT Bombay',
    city: 'Mumbai',
    state: 'Maharashtra',
    domains: ['iitb.ac.in'],
    studentCount: '12,000+ Students',
  },
  {
    id: 'bits-pilani-goa',
    name: 'BITS Pilani, K.K. Birla Goa Campus',
    shortName: 'BITS Goa',
    city: 'Zuarinagar',
    state: 'Goa',
    domains: ['goa.bits-pilani.ac.in', 'pilani.bits-pilani.ac.in'],
    studentCount: '4,500+ Students',
  },
  {
    id: 'dtu-delhi',
    name: 'Delhi Technological University',
    shortName: 'DTU Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    domains: ['dtu.ac.in'],
    studentCount: '14,000+ Students',
  },
  {
    id: 'nit-trichy',
    name: 'National Institute of Technology Tiruchirappalli',
    shortName: 'NIT Trichy',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    domains: ['nitt.edu'],
    studentCount: '7,000+ Students',
  },
  {
    id: 'rvce-bengaluru',
    name: 'R.V. College of Engineering',
    shortName: 'RVCE Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    domains: ['rvce.edu.in'],
    studentCount: '6,000+ Students',
  },
];

export const MOCK_CATEGORIES = [
  { name: 'All Items', icon: 'Sparkles', count: 12 },
  { name: 'Books', icon: 'BookOpen', count: 3 },
  { name: 'Electronics', icon: 'Laptop', count: 2 },
  { name: 'Cycles', icon: 'Bike', count: 1 },
  { name: 'Calculators', icon: 'Calculator', count: 1 },
  { name: 'Lab Equipment', icon: 'FlaskConical', count: 1 },
  { name: 'Hostel Essentials', icon: 'Coffee', count: 1 },
  { name: 'Furniture', icon: 'Armchair', count: 1 },
  { name: 'Fashion', icon: 'Shirt', count: 1 },
  { name: 'Sports', icon: 'Trophy', count: 1 },
  { name: 'Free Stuff', icon: 'Gift', count: 1 },
] as const;

export const INITIAL_MOCK_LISTINGS: MockListing[] = [
  {
    id: 'list-1',
    title: 'Casio fx-991CW ClassWiz Scientific Calculator',
    description: 'Barely used for 2 semesters of Engineering Mathematics. Pristine condition with protective slide-on hard case, solar backup battery fully functioning, and user guide. Approved for university semester exams.',
    price: 850,
    originalPrice: 1495,
    category: 'Calculators',
    dealType: 'Sell',
    condition: 'Like New',
    photos: [
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80'
    ],
    college: 'IIT Bombay',
    campusLocation: 'Hostel 16, Wing B or Central Library',
    postedAt: '2 hours ago',
    viewsCount: 48,
    likesCount: 9,
    isFeatured: true,
    seller: {
      id: 'user-1',
      name: 'Rohan Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      college: 'IIT Bombay',
      branch: 'Computer Science & Engineering',
      year: '3rd Year',
      trustScore: 98,
      rating: 4.9,
      reviewCount: 14,
      isVerified: true,
      joinedDate: 'Aug 2023',
    },
  },
  {
    id: 'list-2',
    title: 'Hercules Roadeo 21-Speed Geared Mountain Cycle',
    description: 'Sturdy 26T alloy frame with front disc brake and dual suspension. Tuned last week with brand new mudguards, comfortable gel seat cover, and combination cable lock included. Smooth shifting across campus climbs.',
    price: 3400,
    originalPrice: 9800,
    category: 'Cycles',
    dealType: 'Sell',
    condition: 'Good',
    photos: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80'
    ],
    college: 'IIT Bombay',
    campusLocation: 'Cycle Stand, Near SAC (Student Activity Centre)',
    postedAt: '4 hours ago',
    viewsCount: 112,
    likesCount: 23,
    isFeatured: true,
    seller: {
      id: 'user-2',
      name: 'Priya Nambiar',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      college: 'IIT Bombay',
      branch: 'Electrical Engineering',
      year: 'Final Year',
      trustScore: 96,
      rating: 4.8,
      reviewCount: 19,
      isVerified: true,
      joinedDate: 'Jul 2022',
    },
  },
  {
    id: 'list-3',
    title: 'Higher Engineering Mathematics (44th Edition) - B.S. Grewal',
    description: 'The definitive textbook for 1st & 2nd year B.Tech engineering syllabus. Completely clean pages without pen scribbles. Binding is tight and intact. Save 60% compared to campus bookstore.',
    price: 420,
    originalPrice: 950,
    category: 'Books',
    dealType: 'Sell',
    condition: 'Like New',
    photos: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    college: 'IIT Bombay',
    campusLocation: 'Department of Mechanical Engineering Lobby',
    postedAt: 'Yesterday',
    viewsCount: 65,
    likesCount: 12,
    seller: {
      id: 'user-3',
      name: 'Aditya Verma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      college: 'IIT Bombay',
      branch: 'Mechanical Engineering',
      year: '2nd Year',
      trustScore: 92,
      rating: 4.7,
      reviewCount: 8,
      isVerified: true,
      joinedDate: 'Jan 2024',
    },
  },
  {
    id: 'list-4',
    title: 'Pigeon Cruise 1800W Portable Induction Cooktop + Steel Pan',
    description: 'Hostel friendly induction stove with 7 preset cooking menus and auto-shutoff. Perfect for late night Maggi, boiling milk, and tea. Works flawlessly on hostel room voltage. Stainless steel non-stick pan included.',
    price: 1150,
    originalPrice: 2490,
    category: 'Hostel Essentials',
    dealType: 'Sell',
    condition: 'Good',
    photos: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    ],
    college: 'IIT Bombay',
    campusLocation: 'Hostel 12, Mess Entrance',
    postedAt: '1 day ago',
    viewsCount: 89,
    likesCount: 18,
    seller: {
      id: 'user-4',
      name: 'Kavita Menon',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      college: 'IIT Bombay',
      branch: 'Chemical Engineering',
      year: '4th Year',
      trustScore: 99,
      rating: 5.0,
      reviewCount: 22,
      isVerified: true,
      joinedDate: 'Aug 2021',
    },
  },
  {
    id: 'list-5',
    title: 'Omega Engineering Mini Drafter + Wooden Drawing Board',
    description: 'Complete Engineering Graphics kit with heavy-duty metal clamp mini-drafter, sheet holder clips, and imperial size pinewood drawing board with canvas carry bag. Ideal for First Year B.Tech CAD/ED students.',
    price: 450,
    originalPrice: 1100,
    category: 'Lab Equipment',
    dealType: 'Sell',
    condition: 'Like New',
    photos: [
      'https://images.unsplash.com/photo-1581291518655-9523c932ede3?auto=format&fit=crop&w=800&q=80'
    ],
    college: 'IIT Bombay',
    campusLocation: 'Civil Engineering Workshop Gate',
    postedAt: '2 days ago',
    viewsCount: 54,
    likesCount: 7,
    seller: {
      id: 'user-1',
      name: 'Rohan Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      college: 'IIT Bombay',
      branch: 'Computer Science & Engineering',
      year: '3rd Year',
      trustScore: 98,
      rating: 4.9,
      reviewCount: 14,
      isVerified: true,
      joinedDate: 'Aug 2023',
    },
  },
  {
    id: 'list-6',
    title: 'Kindle Paperwhite (10th Gen) 8GB - Waterproof with Backlight',
    description: 'Selling because I upgraded. 300 ppi glare-free screen that reads like real paper even in bright campus sunlight. Battery lasts weeks on a single charge. Free textured leather flip case included.',
    price: 4200,
    originalPrice: 8999,
    category: 'Electronics',
    dealType: 'Sell',
    condition: 'Like New',
    photos: [
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80'
    ],
    college: 'IIT Bombay',
    campusLocation: 'Central Cafeteria or Main Gate CCD',
    postedAt: '3 days ago',
    viewsCount: 140,
    likesCount: 31,
    isFeatured: true,
    seller: {
      id: 'user-5',
      name: 'Siddharth Roy',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      college: 'IIT Bombay',
      branch: 'Aerospace Engineering',
      year: '3rd Year',
      trustScore: 94,
      rating: 4.8,
      reviewCount: 11,
      isVerified: true,
      joinedDate: 'Nov 2023',
    },
  },
  {
    id: 'list-7',
    title: 'Ergonomic Foldable Bed Study Table with iPad & Cup Slot',
    description: 'High-density MDF wooden top with heavy steel curved legs. Non-slip rubber pads keep it firm on the hostel bed. Folds flat in 2 seconds to slide under the mattress or behind wardrobe.',
    price: 380,
    originalPrice: 899,
    category: 'Furniture',
    dealType: 'Sell',
    condition: 'Good',
    photos: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80'
    ],
    college: 'IIT Bombay',
    campusLocation: 'Hostel 15, Ground Floor Common Room',
    postedAt: '3 days ago',
    viewsCount: 76,
    likesCount: 14,
    seller: {
      id: 'user-3',
      name: 'Aditya Verma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      college: 'IIT Bombay',
      branch: 'Mechanical Engineering',
      year: '2nd Year',
      trustScore: 92,
      rating: 4.7,
      reviewCount: 8,
      isVerified: true,
      joinedDate: 'Jan 2024',
    },
  },
  {
    id: 'list-8',
    title: 'Yonex Carbonex 8000 Plus Badminton Racket (Strung with BG65)',
    description: 'Graphite shaft with round head frame for excellent repulsion. Strung freshly at 24 lbs tension with durable Yonex BG-65 string. Free full-length padded thermal racket cover included.',
    price: 900,
    originalPrice: 2190,
    category: 'Sports',
    dealType: 'Sell',
    condition: 'Like New',
    photos: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'
    ],
    college: 'IIT Bombay',
    campusLocation: 'Gymkhana Badminton Courts',
    postedAt: '4 days ago',
    viewsCount: 82,
    likesCount: 19,
    seller: {
      id: 'user-2',
      name: 'Priya Nambiar',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      college: 'IIT Bombay',
      branch: 'Electrical Engineering',
      year: 'Final Year',
      trustScore: 96,
      rating: 4.8,
      reviewCount: 19,
      isVerified: true,
      joinedDate: 'Jul 2022',
    },
  },
  {
    id: 'list-9',
    title: 'GATE Computer Science 2026 Made Easy Complete Postal Package',
    description: 'Set of 12 theory workbooks + 2 general aptitude guides + 3 previous 20 years solved question banks. Crisp highlighter markings in 2 books only; rest are completely unread.',
    price: 1600,
    originalPrice: 6500,
    category: 'Books',
    dealType: 'Sell',
    condition: 'Good',
    photos: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
    ],
    college: 'IIT Bombay',
    campusLocation: 'Computer Science Department, Reading Room',
    postedAt: '5 days ago',
    viewsCount: 198,
    likesCount: 42,
    seller: {
      id: 'user-1',
      name: 'Rohan Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      college: 'IIT Bombay',
      branch: 'Computer Science & Engineering',
      year: '3rd Year',
      trustScore: 98,
      rating: 4.9,
      reviewCount: 14,
      isVerified: true,
      joinedDate: 'Aug 2023',
    },
  },
  {
    id: 'list-10',
    title: 'Cotton Chemistry Lab Coat (Size 38) + Eye Protection Goggles',
    description: 'Giving away for free to any junior who needs it for Chemistry or Metallurgy lab! Thick pure cotton, freshly washed, no acid burns or chemical stains. Collect from Hostel 12.',
    price: 0,
    originalPrice: 600,
    category: 'Free Stuff',
    dealType: 'Free',
    condition: 'Good',
    photos: [
      'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80'
    ],
    college: 'IIT Bombay',
    campusLocation: 'Hostel 12, Ground Floor Porch',
    postedAt: '5 days ago',
    viewsCount: 230,
    likesCount: 56,
    seller: {
      id: 'user-4',
      name: 'Kavita Menon',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      college: 'IIT Bombay',
      branch: 'Chemical Engineering',
      year: '4th Year',
      trustScore: 99,
      rating: 5.0,
      reviewCount: 22,
      isVerified: true,
      joinedDate: 'Aug 2021',
    },
  },
  {
    id: 'list-11',
    title: 'Heavyweight College Pullover Hoodie (Navy Blue, Size L)',
    description: 'Official 380 GSM fleece hoodie with warm kangaroo pocket and metal drawstrings. Barely worn during one winter fest. No lint or fading.',
    price: 550,
    originalPrice: 1400,
    category: 'Fashion',
    dealType: 'Sell',
    condition: 'Good',
    photos: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
    ],
    college: 'IIT Bombay',
    campusLocation: 'Hostel 14 Canteen',
    postedAt: '6 days ago',
    viewsCount: 61,
    likesCount: 11,
    seller: {
      id: 'user-5',
      name: 'Siddharth Roy',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      college: 'IIT Bombay',
      branch: 'Aerospace Engineering',
      year: '3rd Year',
      trustScore: 94,
      rating: 4.8,
      reviewCount: 11,
      isVerified: true,
      joinedDate: 'Nov 2023',
    },
  },
  {
    id: 'list-12',
    title: 'Sennheiser HD 206 Wired Over-Ear Headphones',
    description: 'Clean silver/black studio monitoring headphones with 3.5mm gold plated jack and 3-meter cord. Clear bass and crisp sound. Perfect for study sessions in the campus library.',
    price: 750,
    originalPrice: 1990,
    category: 'Electronics',
    dealType: 'Sell',
    condition: 'Good',
    photos: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ],
    college: 'IIT Bombay',
    campusLocation: 'Central Library Level 2',
    postedAt: '1 week ago',
    viewsCount: 104,
    likesCount: 17,
    seller: {
      id: 'user-3',
      name: 'Aditya Verma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      college: 'IIT Bombay',
      branch: 'Mechanical Engineering',
      year: '2nd Year',
      trustScore: 92,
      rating: 4.7,
      reviewCount: 8,
      isVerified: true,
      joinedDate: 'Jan 2024',
    },
  },
];

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'notif-1',
    type: 'offer',
    title: 'New Offer Received!',
    message: 'Aman Patel offered ₹750 for your Casio fx-991CW Calculator.',
    time: '15m ago',
    isRead: false,
    link: '/messages',
  },
  {
    id: 'notif-2',
    type: 'meetup',
    title: 'Safe Campus Meetup Today',
    message: 'Meetup scheduled with Rohan at Central Library Lobby at 4:30 PM. Share your 6-digit handshake code only upon inspection.',
    time: '2h ago',
    isRead: false,
    link: '/messages',
  },
  {
    id: 'notif-3',
    type: 'system',
    title: 'Campus Domain Verified',
    message: 'Your @iitb.ac.in student address has been confirmed. You now have full campus trading privileges.',
    time: '1d ago',
    isRead: true,
  },
  {
    id: 'notif-4',
    type: 'message',
    title: 'New message from Priya',
    message: '"Can you meet near the SAC cycle stand around 5 PM?"',
    time: '2d ago',
    isRead: true,
    link: '/messages',
  },
];

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: 'conv-1',
    listingId: 'list-1',
    listingTitle: 'Casio fx-991CW ClassWiz Scientific Calculator',
    listingPrice: 850,
    listingImage: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=300&q=80',
    partnerName: 'Aman Patel',
    partnerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    partnerCollege: 'IIT Bombay (CSE 2nd Year)',
    lastMessage: 'Sure, let us meet tomorrow at 4:30 PM outside the Central Library.',
    lastMessageTime: '15m ago',
    unreadCount: 1,
    messages: [
      {
        id: 'msg-1',
        senderId: 'partner',
        senderName: 'Aman Patel',
        text: 'Hey! Is this calculator still available? I need it for the mid-sem exams next week.',
        time: '3:10 PM',
        isMe: false,
      },
      {
        id: 'msg-2',
        senderId: 'me',
        senderName: 'Me',
        text: 'Yes Aman! It is available, battery is fully charged and comes with the hard cover.',
        time: '3:14 PM',
        isMe: true,
      },
      {
        id: 'msg-3',
        senderId: 'partner',
        senderName: 'Aman Patel',
        text: 'Awesome. Would you accept ₹800 if I pick it up directly from your hostel?',
        time: '3:20 PM',
        isMe: false,
      },
      {
        id: 'msg-4',
        senderId: 'me',
        senderName: 'Me',
        text: '₹800 works fine. Let us meet tomorrow at 4:30 PM outside the Central Library.',
        time: '3:25 PM',
        isMe: true,
      },
      {
        id: 'msg-5',
        senderId: 'partner',
        senderName: 'Aman Patel',
        text: 'Sure, let us meet tomorrow at 4:30 PM outside the Central Library.',
        time: '3:27 PM',
        isMe: false,
      },
    ],
  },
  {
    id: 'conv-2',
    listingId: 'list-2',
    listingTitle: 'Hercules Roadeo 21-Speed Geared Mountain Cycle',
    listingPrice: 3400,
    listingImage: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=300&q=80',
    partnerName: 'Priya Nambiar',
    partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    partnerCollege: 'IIT Bombay (EE Final Year)',
    lastMessage: 'The cycle lock code is 1429. You can take a test ride near the SAC stand.',
    lastMessageTime: '3h ago',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-201',
        senderId: 'me',
        senderName: 'Me',
        text: 'Hi Priya, I am interested in checking out the cycle. Are both gears functioning smoothly?',
        time: '11:00 AM',
        isMe: true,
      },
      {
        id: 'msg-202',
        senderId: 'partner',
        senderName: 'Priya Nambiar',
        text: 'Yes! Shimano Tourney derailleurs on both front and rear. Tuned last week.',
        time: '11:30 AM',
        isMe: false,
      },
      {
        id: 'msg-203',
        senderId: 'partner',
        senderName: 'Priya Nambiar',
        text: 'The cycle lock code is 1429. You can take a test ride near the SAC stand.',
        time: '12:05 PM',
        isMe: false,
      },
    ],
  },
];

export const MOCK_REVIEWS: MockReview[] = [
  {
    id: 'rev-1',
    reviewerName: 'Varun Nair',
    reviewerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
    reviewerBranch: 'Civil Engg, 3rd Year',
    rating: 5,
    date: '1 week ago',
    comment: 'Super fast meetup at Hostel 14. Book was in mint condition just like shown in the photos. Highly recommended seller!',
    itemTitle: 'Fluid Mechanics - Fox & McDonald',
  },
  {
    id: 'rev-2',
    reviewerName: 'Ananya Deshpande',
    reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    reviewerBranch: 'Design, 2nd Year',
    rating: 5,
    date: '3 weeks ago',
    comment: 'Smooth and polite transaction. She verified the item condition with me before accepting payment. Very trustworthy!',
    itemTitle: 'Wacom One Drawing Tablet',
  },
  {
    id: 'rev-3',
    reviewerName: 'Tanmay Saxena',
    reviewerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    reviewerBranch: 'Chemical Engg, 4th Year',
    rating: 5,
    date: '1 month ago',
    comment: 'Punctual meetup at Library Cafe. Product worked as described without any issues.',
    itemTitle: 'Logitech M331 Wireless Mouse',
  },
];

export const CURRENT_STUDENT_USER = {
  id: 'student-me',
  fullName: 'Aryan Sharma',
  email: 'aryan.sharma@iitb.ac.in',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  college: 'IIT Bombay',
  collegeDomain: 'iitb.ac.in',
  branch: 'Computer Science & Engineering',
  graduationYear: '2026',
  studentId: '22B0934',
  hostel: 'Hostel 16, Room 304',
  trustScore: 98,
  verifiedStatus: 'STUDENT_VERIFIED' as const,
  itemsSold: 14,
  itemsBought: 8,
  meetupSuccessRate: 100,
  rating: 4.9,
  reviewsCount: 18,
  savedListingIds: ['list-1', 'list-2', 'list-4'],
  joinedDate: 'July 2023',
  bio: 'Pre-final year CSE undergrad at IIT Bombay. Selling coursework textbooks, engineering tools, and hostel gear when no longer needed.',
};
