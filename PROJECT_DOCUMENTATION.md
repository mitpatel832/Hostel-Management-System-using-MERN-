# HostelHive — Full-Stack MERN Hostel Management System

**HostelHive** is an automated, full-stack MERN application built for college hostel management. It provides role-based management for **Warden / Staff Administrators** and **Student Residents**, replacing traditional register books with real-time digital tracking.

---

## 1. System Architecture & Syllabus Alignment

### Technology Stack (MERN)
- **Database (MongoDB & Mongoose)**: NoSQL document database running locally at `mongodb://localhost:27017/hostelhive`. Defines schemas with validation, defaults, and relational references (`ObjectId`).
- **Backend Framework (Express.js & Node.js)**: RESTful API server running at `http://localhost:5000`. Features JWT authentication (`jsonwebtoken`), password hashing (`bcryptjs`), and role-based authorization middleware.
- **Frontend Framework (React.js)**: Single-Page Application (SPA) running at `http://localhost:3000`. Features React Router DOM v6 navigation, Context API state management (`AuthContext`), and Axios API integration.
- **Styling**: Tailwind CSS & Vanilla CSS design system.

---

## 2. Directory Structure

```text
hostelhive/
├── backend/                        [Node.js, Express.js & MongoDB]
│   ├── config/
│   │   └── db.js                   [MongoDB Mongoose Connection]
│   ├── controllers/                [REST API Business Logic]
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── roomController.js
│   │   ├── complaintController.js
│   │   ├── feeController.js
│   │   ├── noticeController.js
│   │   └── dashboardController.js
│   ├── middleware/                 [Express Middleware & JWT Auth]
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/                     [NoSQL Data Schemas - Mongoose]
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Room.js
│   │   ├── Complaint.js
│   │   ├── Fee.js
│   │   └── Notice.js
│   ├── routes/                     [HTTP REST API Endpoints]
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── roomRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── feeRoutes.js
│   │   ├── noticeRoutes.js
│   │   └── dashboardRoutes.js
│   ├── seeder/
│   │   └── seedData.js             [MongoDB Seeder Script]
│   ├── .env
│   ├── package.json
│   └── server.js                   [Express Server Entry Point]
│
├── frontend/                       [React.js, HTML5, CSS3, JS]
│   ├── public/
│   │   └── index.html              [HTML5 Entry & Typography]
│   ├── src/
│   │   ├── assets/                 [Images & Static Media]
│   │   ├── components/             [React Functional Components]
│   │   ├── context/                [React Context API State]
│   │   ├── pages/                  [React Router Views]
│   │   ├── services/               [Axios API Integration]
│   │   ├── App.jsx                 [Main React App & Routes]
│   │   ├── index.js                [React DOM Root]
│   │   └── index.css               [CSS3 Styling & Variables]
│   ├── .env
│   └── package.json
│
├── .gitignore
└── PROJECT_DOCUMENTATION.md        [Viva & Architecture Guide]
```

---

## 3. Database Schemas (MongoDB / Mongoose)

1. **`User`**: System authentication user (`fullName`, `email`, `phone`, `password` hashed, `role: 'warden' | 'student'`).
2. **`Student`**: Academic and hostel profile linked to `userId` and `roomId` (`studentId`, `department`, `year`, `semester`, `guardianDetails`, `status`).
3. **`Room`**: Room metadata & occupancy counter (`roomNumber`, `block`, `floor`, `capacity`, `currentOccupancy`, `rentPerMonth`, `amenities`, `status`).
4. **`Complaint`**: Ticket tracking (`ticketId`, `studentId`, `category`, `title`, `description`, `status: 'pending' | 'in-progress' | 'resolved'`, `feedback`).
5. **`Fee`**: Digital invoices & receipts (`invoiceId`, `receiptNumber`, `studentId`, `type`, `amount`, `dueDate`, `status: 'paid' | 'unpaid' | 'overdue'`).
6. **`Notice`**: Broadcast announcements (`title`, `content`, `category`, `priority`, `targetAudience`, `postedBy`).

---

## 4. Default Seeded Test Credentials

Run seeder script:
```bash
cd backend
npm run seed
```

* **Hostel Warden (Admin)**: `warden@hostelhive.com` / `warden123`
* **Student Resident**: `rahul@student.com` / `student123`

---

## 5. How to Run Locally

### Backend Server
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### Frontend Application
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```
