# HostelHive — Modern MERN Hostel Management System

**HostelHive** is an automated, full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application designed for college hostel management. It provides role-based access for **Warden / Staff Administrators** and **Student Residents**.

---

## 📂 Project Architecture & Directory Map

```text
hostelhive/
│
├── 📂 backend/                                 # Node.js & Express API Server
│   ├── 📂 config/
│   │   └── 📄 db.js                           # MongoDB database connection logic
│   │
│   ├── 📂 controllers/                        # Business logic & API request handlers
│   │   ├── 📄 authController.js               # Login, register, profile logic
│   │   ├── 📄 complaintController.js          # Maintenance tickets (create, resolve)
│   │   ├── 📄 dashboardController.js          # Warden/Student stats & summaries
│   │   ├── 📄 feeController.js                # Digital receipts (RCP-YYYYMM-XXXX) & dues
│   │   ├── 📄 noticeController.js             # Warden broadcast notices
│   │   ├── 📄 roomController.js               # Room allocation & bed tracking
│   │   └── 📄 studentController.js            # Student profile directory
│   │
│   ├── 📂 middleware/                         # Security & access control
│   │   ├── 📄 authMiddleware.js               # JWT Token verifier
│   │   └── 📄 roleMiddleware.js               # Role access (isWarden / isStudent)
│   │
│   ├── 📂 models/                             # MongoDB Mongoose Data Schemas
│   │   ├── 📄 Complaint.js                    # Maintenance tickets schema
│   │   ├── 📄 Fee.js                          # Receipts & invoice schema
│   │   ├── 📄 Notice.js                       # Notices schema
│   │   ├── 📄 Room.js                         # Hostel rooms & beds schema
│   │   ├── 📄 Student.js                      # Extended student profile schema
│   │   └── 📄 User.js                         # Core authentication account schema
│   │
│   ├── 📂 routes/                             # REST API HTTP Route Endpoints
│   │   ├── 📄 authRoutes.js                   # /api/auth
│   │   ├── 📄 complaintRoutes.js              # /api/complaints
│   │   ├── 📄 dashboardRoutes.js              # /api/dashboard
│   │   ├── 📄 feeRoutes.js                    # /api/fees
│   │   ├── 📄 noticeRoutes.js                 # /api/notices
│   │   ├── 📄 roomRoutes.js                   # /api/rooms
│   │   └── 📄 studentRoutes.js                # /api/students
│   │
│   ├── 📂 seeder/
│   │   └── 📄 seedData.js                     # Demo database population script
│   │
│   ├── 📄 .env                                # Environment variables (Port 5000, MONGO_URI)
│   ├── 📄 package.json                        # Backend npm dependencies
│   └── 📄 server.js                           # Entry point for Express server
│
├── 📂 frontend/                                # React.js Web Application
│   ├── 📂 public/
│   │   └── 📄 index.html                      # Main HTML page & Google Fonts
│   │
│   └── 📂 src/
│       ├── 📂 assets/                         # Real hostel images & icons
│       │
│       ├── 📂 components/                     # Reusable React Components
│       │   ├── 📂 auth/
│       │   │   ├── 📄 LoginForm.jsx           # Login tab component
│       │   │   └── 📄 RegisterForm.jsx        # Student registration form
│       │   │
│       │   ├── 📂 common/
│       │   │   ├── 📄 Card.jsx                # Custom styled card container
│       │   │   ├── 📄 Footer.jsx              # Footer section
│       │   │   ├── 📄 Navbar.jsx              # Navigation bar with sliding indicator
│       │   │   └── 📄 Sidebar.jsx             # Dashboard navigation sidebar
│       │   │
│       │   ├── 📂 landing/                    # Public Landing Page Sections
│       │   │   ├── 📄 ContactSection.jsx      # Admin contact info & inquiry form
│       │   │   ├── 📄 FaqSection.jsx          # FAQ accordion questions
│       │   │   ├── 📄 FeaturesSection.jsx     # App features overview
│       │   │   ├── 📄 HeroSection.jsx         # Hero title & live console preview
│       │   │   ├── 📄 ReviewsSection.jsx      # Student & parent reviews
│       │   │   └── 📄 StatSection.jsx         # Live occupancy stats strip
│       │   │
│       │   ├── 📂 student/                    # Student Portal Views
│       │   │   ├── 📄 ComplaintForm.jsx       # Maintenance ticket submitter
│       │   │   ├── 📄 FeeReceiptModal.jsx     # View printable receipt
│       │   │   └── 📄 RoomCard.jsx            # Assigned room details card
│       │   │
│       │   └── 📂 warden/                     # Warden Management Views
│       │       ├── 📄 NoticeComposer.jsx      # Broadcast new notice
│       │       ├── 📄 OccupancyStats.jsx      # Block-wise bed tracking
│       │       ├── 📄 RoomAssignModal.jsx     # Room allocation modal
│       │       └── 📄 TicketQueue.jsx         # Maintenance complaint resolver
│       │
│       ├── 📂 context/
│       │   └── 📄 AuthContext.js              # Global user session & JWT state
│       │
│       ├── 📂 pages/                          # Page Route Views
│       │   ├── 📄 LandingPage.jsx             # Public homepage (/)
│       │   ├── 📄 LoginPage.jsx               # Auth page (/login)
│       │   ├── 📄 RegisterPage.jsx            # Student signup page (/register)
│       │   ├── 📄 StudentDashboard.jsx        # Student portal (/student/dashboard)
│       │   └── 📄 WardenDashboard.jsx         # Warden console (/warden/dashboard)
│       │
│       ├── 📂 services/
│       │   └── 📄 api.js                      # Axios HTTP client configuration
│       │
│       ├── 📄 App.js                          # Main React Router setup
│       ├── 📄 index.css                       # Global CSS & Design System Tokens
│       └── 📄 index.js                        # React DOM rendering root
│
├── 📄 .gitignore                              # Git ignored files (node_modules, .env)
├── 📄 PROJECT_DOCUMENTATION.md                # Full viva documentation & API guide
└── 📄 README.md                               # Project quick-start instructions
```

---
