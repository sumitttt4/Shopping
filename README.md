# 🛒 E-Commerce Admin Panel

A **production-ready** e-commerce admin panel built with React TypeScript frontend and Node.js Express backend. Features comprehensive product management, order processing, customer management, and real-time analytics.

![Project Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Backend](https://img.shields.io/badge/Backend-100%25%20Complete-brightgreen)
![Frontend](https://img.shields.io/badge/Frontend-80%25%20Complete-yellow)

## Features

### 🎯 Admin Dashboard
- Real-time analytics and charts
- Quick action panels
- Mobile-first responsive design
- Push notifications and alerts

### 📦 Product Management
- Complete CRUD operations
- Drag-n-drop interface
- Image/video upload with optimization
- Product variants and categories
- Bulk operations
- Advanced search and filtering

### 👥 Customer Management
- Customer profiles and segmentation
- Order history tracking
- Communication tools

### 📊 Analytics & Reporting
- Sales metrics and trends
- Custom report generation
- Export capabilities (PDF, Excel, CSV)

### 🔐 Security
- JWT authentication
- Role-based access control
- Rate limiting
- Input validation and sanitization

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer + Sharp
- **Real-time**: Socket.IO
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate limiting

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Forms**: React Hook Form + Yup
- **Charts**: Chart.js + Recharts
- **Drag & Drop**: React Beautiful DnD
- **Animations**: Framer Motion

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Shopping
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run migrate
   npm run seed
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start Development Servers**
   ```bash
   # Backend (runs on port 5000)
   cd backend
   npm run dev

   # Frontend (runs on port 5173)
   cd frontend
   npm run dev
   ```

### Production Deployment

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Backend**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout

### Product Endpoints
- `GET /api/products` - List products with pagination
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/bulk` - Bulk operations

### Category Endpoints
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Order Endpoints
- `GET /api/orders` - List orders
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/analytics` - Order analytics

## Project Structure

```
Shopping/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── uploads/           # File uploads
│   └── server.js          # Server entry point
└── frontend/
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── pages/         # Page components
    │   ├── hooks/         # Custom hooks
    │   ├── store/         # Redux store
    │   ├── services/      # API services
    │   └── utils/         # Utility functions
    └── public/           # Static assets
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shopping_admin
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.