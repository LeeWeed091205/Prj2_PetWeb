# Pet Community Platform - Code Structure Design
**Date:** 2026-07-02  
**Project:** Prj2_PetWeb  
**Stack:** React.js (Frontend) | Express.js (Backend) | MongoDB (Database)

---

## 1. Project Overview

A **community-driven pet platform** where users can:
- Share and discuss pet-related content (posts, comments)
- Post pets available for adoption/foster with details and photos
- Browse pets needing homes and express adoption interest
- List pet products for sale
- Build a pet community with user profiles

**Target Scale:** Small community (100s-1000s of users)  
**MVP Focus:** User authentication + core features  
**Real-time Features:** Not needed for MVP

---

## 2. Architecture Approach

**Monorepo Structure** (single git repository with organized frontend and backend folders)

### Benefits:
- Single deployment process
- Easy code sharing between layers
- Unified version control
- Simple local development setup

### Directory Layout:
```
Prj2_PetWeb/
├── frontend/          # React.js application
├── backend/           # Express.js API
├── .gitignore
├── README.md
└── docker-compose.yml (optional for local MongoDB)
```

---

## 3. Frontend Architecture (React.js)

### Folder Structure:
```
frontend/src/
├── components/        # Reusable React components
├── pages/            # Full-page components (route-based)
├── layout/           # Layout wrappers (MainLayout, AdminLayout)
├── hooks/            # Custom React hooks
├── services/         # API integration layer
├── context/          # Global state management (React Context API)
├── utils/            # Helper functions and utilities
├── styles/           # Global CSS and variables
├── App.jsx           # Root app component
└── index.jsx         # Entry point
```

### Key Design Decisions:

1. **State Management:** React Context API (sufficient for small community, no Redux needed for MVP)
2. **API Communication:** Axios for HTTP requests (via services layer)
3. **Routing:** React Router v6 for page navigation
4. **Styling:** CSS modules or Tailwind CSS for styling
5. **Component Pattern:** Functional components with hooks (modern React)

---

## 4. Backend Architecture (Express.js)

### Folder Structure:
```
backend/src/
├── models/           # MongoDB schemas (Mongoose)
├── routes/           # API endpoint definitions
├── controllers/      # Business logic
├── middleware/       # Express middleware (auth, validation, error handling)
├── config/           # Configuration files (DB connection, env vars)
├── utils/            # Helper functions (JWT, password hashing, responses)
├── server.js         # Express app setup
└── index.js          # Entry point
```

### Key Design Decisions:

1. **Pattern:** MVC (Model-View-Controller) structure for scalability
2. **Database:** MongoDB with Mongoose ODM
3. **Authentication:** JWT (JSON Web Tokens) for stateless auth
4. **Validation:** Input validation middleware for all routes
5. **Error Handling:** Centralized error handler middleware
6. **API Response:** Standardized response format across all endpoints

---

## 5. Data Models (MongoDB)

### Core Collections:

**User**
```
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed with bcryptjs),
  username: String,
  role: String (enum: ['ADMIN', 'USER']),
  profile: {
    avatar: String (URL),
    bio: String,
    location: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Post**
```
{
  _id: ObjectId,
  author: ObjectId (ref: User),
  content: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Comment**
```
{
  _id: ObjectId,
  author: ObjectId (ref: User),
  postId: ObjectId (ref: Post) [optional if commenting on Adoption],
  adoptionId: ObjectId (ref: Adoption) [optional if commenting on Adoption],
  content: String,
  createdAt: Date
}
```

**Product**
```
{
  _id: ObjectId,
  seller: ObjectId (ref: User),
  title: String,
  description: String,
  price: Number,
  images: [String] (URLs),
  createdAt: Date,
  updatedAt: Date
}
```

**Adoption**
```
{
  _id: ObjectId,
  owner: ObjectId (ref: User),
  petName: String,
  petType: String (dog, cat, rabbit, etc.),
  age: String,
  description: String,
  images: [String] (URLs),
  location: String,
  contactInfo: String,
  status: String (enum: ['available', 'pending', 'adopted']),
  adoptionRequests: [ObjectId] (ref: User - users interested in adopting),
  createdAt: Date,
  updatedAt: Date
}
```

### Relationships:
- User → has many Posts, Comments, Products, Adoptions
- Post → has many Comments
- Adoption → has many Comments
- Adoption → has AdoptionRequests (array of User IDs)

---

## 6. API Endpoints (MVP)

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/logout` - User logout

### Posts & Comments
- `GET /api/posts` - List all posts
- `POST /api/posts` - Create post (auth required)
- `GET /api/posts/:id` - Get post details
- `DELETE /api/posts/:id` - Delete post (auth required, own post or admin)
- `POST /api/posts/:id/comments` - Comment on post (auth required)
- `DELETE /api/comments/:id` - Delete comment (auth required, own comment or admin)

### Adoptions
- `GET /api/adoptions` - List all pets available for adoption
- `POST /api/adoptions` - Post a pet for adoption (auth required)
- `GET /api/adoptions/:id` - Get adoption post details
- `PUT /api/adoptions/:id` - Update adoption status (auth required, owner or admin)
- `DELETE /api/adoptions/:id` - Delete adoption post (auth required, owner or admin)
- `POST /api/adoptions/:id/interest` - Express interest to adopt (auth required)
- `GET /api/adoptions/:id/comments` - Get comments on adoption post
- `POST /api/adoptions/:id/comments` - Comment on adoption post (auth required)

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product listing (auth required)
- `GET /api/products/:id` - Get product details
- `DELETE /api/products/:id` - Delete product (auth required, owner or admin)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile (auth required, own profile or admin)

### Admin
- `GET /api/admin/users` - List all users (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `PUT /api/admin/users/:id/role` - Change user role (admin only)

---

## 7. Technology Stack & Libraries

### Frontend (React.js)
**Core:**
- `react` - UI library
- `react-dom` - DOM rendering
- `react-router-dom` - Client-side routing

**HTTP & State:**
- `axios` - HTTP client
- `react-context-api` - Global state (built-in)

**Styling:**
- `tailwindcss` OR `styled-components` - Styling solution

**Development:**
- `vite` - Build tool (faster than Create React App)
- `eslint` - Code linting
- `prettier` - Code formatting

**Optional (add if needed):**
- `react-query` - Data fetching and caching
- `zod` or `yup` - Form validation

---

### Backend (Express.js)
**Core:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variable management

**Authentication & Security:**
- `jsonwebtoken` - JWT generation and verification
- `bcryptjs` - Password hashing
- `cors` - CORS handling

**Validation & Middleware:**
- `express-validator` - Input validation
- `helmet` - Security headers
- `morgan` - HTTP request logging

**Development:**
- `nodemon` - Auto-restart on file changes
- `eslint` - Code linting

**Database:**
- `mongodb` - Database driver (included with Mongoose)

---

## 8. Development Workflow

### Local Setup:
```bash
# Clone and install
git clone <repo>
cd Prj2_PetWeb

# Frontend
cd frontend
npm install
npm run dev

# Backend (new terminal)
cd backend
npm install
npm run dev

# MongoDB (if using Docker)
docker-compose up
```

### Environment Variables:

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

**Backend (.env):**
```
MONGODB_URI=mongodb://localhost:27017/petweb
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=5000
```

---

## 9. Deployment (Future)

- **Frontend:** Deploy to Vercel, Netlify, or AWS S3 + CloudFront
- **Backend:** Deploy to Heroku, Railway, Render, or AWS EC2
- **Database:** MongoDB Atlas (cloud) or self-hosted MongoDB

---

## 10. Feature Priority (MVP)

1. **Phase 1:** User authentication + basic structure
2. **Phase 2:** Posts, comments, adoptions
3. **Phase 3:** Products listing
4. **Phase 4:** Admin panel
5. **Phase 5:** Advanced features (search, filters, notifications)

---

## Summary

This design provides:
✅ Clear separation of concerns (components, pages, services)  
✅ Scalable MVC architecture for backend  
✅ Standard JWT authentication with role-based access (ADMIN/USER)  
✅ Adoption/foster feature as core platform value  
✅ Small-team friendly monorepo structure  
✅ Clear API contract with authorization rules  
✅ Production-ready library choices  

Ready to implement!
