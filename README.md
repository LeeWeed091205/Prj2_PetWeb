# PetWeb - Pet Community Platform 🐾

A full-stack community platform for pet lovers to share posts, find pets for adoption, and buy/sell pet products.

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool (faster than CRA)
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Express.js** - Web framework
- **Node.js 16+** - JavaScript runtime
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Cors** - Cross-origin requests
- **Helmet** - Security headers

### Database
- **MongoDB 7.0** - NoSQL database
- **Docker Compose** - Local MongoDB setup

---

## System Requirements

- **Node.js**: v16.x or higher
- **npm**: v8.x or higher
- **MongoDB**: Local instance or MongoDB Atlas (cloud)
- **Git**: For version control

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/LeeWeed091205/Prj2_PetWeb.git
cd Prj2_PetWeb
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## Setup & Configuration

### Backend Environment Variables

Create `backend/.env` file (already included in repo):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/petweb
JWT_SECRET=dev_jwt_secret_key_12345
JWT_EXPIRE=24h
```

### Frontend Environment Variables

Create `frontend/.env` file (already included in repo):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Running the Application

### Option 1: Using Docker (Recommended)

Start MongoDB with Docker Compose:

```bash
docker-compose up -d
```

### Option 2: Local MongoDB

Make sure you have MongoDB running locally on `mongodb://localhost:27017`

---

## Starting the Servers

Open **two separate terminal windows**:

### Terminal 1: Backend (Port 5000)

```bash
cd backend
npm run dev
```

Expected output:
```
✓ Server running on http://localhost:5000
```

### Terminal 2: Frontend (Port 5173)

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.0 ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## API Endpoints

### Health Check
- `GET /api/health` - Server status

### Authentication (To be implemented)
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Posts (To be implemented)
- `GET /api/posts` - List all posts
- `POST /api/posts` - Create post
- `DELETE /api/posts/:id` - Delete post

### Adoptions (To be implemented)
- `GET /api/adoptions` - List pets for adoption
- `POST /api/adoptions` - Post pet for adoption
- `POST /api/adoptions/:id/interest` - Express adoption interest

### Products (To be implemented)
- `GET /api/products` - List all products
- `POST /api/products` - Create product listing
- `DELETE /api/products/:id` - Delete product

---

## Project Structure

```
Prj2_PetWeb/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Full page components
│   │   ├── layout/          # Layout wrappers
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── context/         # React Context
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # CSS files
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                  # Express application
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Configuration
│   │   ├── utils/           # Helper functions
│   │   ├── server.js
│   │   └── index.js
│   └── package.json
│
├── docker-compose.yml       # MongoDB Docker setup
├── .gitignore
├── DESIGN.md               # Architecture documentation
└── README.md              # This file
```

---

## Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** to frontend or backend

3. **Commit changes**
   ```bash
   git commit -m "feat: description of what you did"
   ```

4. **Push to remote**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request** on GitHub

---

## Useful Commands

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

### Backend
```bash
npm run dev      # Start with nodemon (auto-reload)
npm run start    # Start production server
npm run lint     # Lint code
```

### Database
```bash
docker-compose up      # Start MongoDB
docker-compose down    # Stop MongoDB
docker-compose logs    # View logs
```

---

## Features (MVP)

- ✅ User authentication (register/login)
- ✅ Posts with comments
- ✅ Pet adoption listings
- ✅ Product marketplace
- ✅ User profiles
- ⏳ Search & filtering
- ⏳ Image uploads
- ⏳ Real-time notifications

---

## Troubleshooting

### Backend won't start
- Check if port 5000 is in use
- Ensure MongoDB is running
- Check `.env` file configuration

### Frontend won't start
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check if port 5173 is in use

### MongoDB connection error
- Ensure MongoDB is running (Docker or local)
- Check `MONGODB_URI` in `.env`
- Default: `mongodb://localhost:27017/petweb`

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a PR

Happy coding! 🚀