# 🎯 Referral Dashboard - Complete Setup Guide

## 📋 Features Included

✅ **Frontend (React)**
- Complete login/signup page with validation
- User dashboard showing name, referral code, and donations raised
- Rewards/unlockables section with progress tracking
- Interactive leaderboard with real-time data
- Responsive design with modern UI

✅ **Backend (Node.js + Express + MongoDB)**
- JWT-based authentication system
- REST API for user management
- MongoDB integration for data persistence
- User registration and login endpoints
- Dashboard data and leaderboard APIs
- Demo data seeding functionality

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Create backend directory
mkdir referral-backend
cd referral-backend

# Initialize npm and install dependencies
npm init -y
npm install express mongoose cors bcryptjs jsonwebtoken dotenv
npm install -D nodemon

# Create server.js file (copy from backend artifact)
# Create .env file
echo "MONGODB_URI=mongodb+srv://akshadapastambh37:AB5vk0dmNBepzWeC@cluster0.pvhgggx.mongodb.net/referral_dashboard?retryWrites=true&w=majority&appName=Cluster0" > .env
echo "JWT_SECRET=your-super-secret-jwt-key-here" >> .env
echo "PORT=5000" >> .env

# Start the server
npm run dev
```

### 2. Frontend Setup

```bash
# Create React app
npx create-react-app referral-frontend
cd referral-frontend

# Replace src/App.js with the frontend artifact code
# Install Tailwind CSS (optional but recommended)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start the frontend
npm start
```

### 3. Database Setup

Your MongoDB database will be automatically created. To populate with demo data:

```bash
# Make a POST request to seed demo data
curl -X POST http://localhost:5000/api/seed
```

## 🔗 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/signup` | Create new user account | No |
| POST | `/api/login` | User login | No |
| GET | `/api/dashboard` | Get user dashboard data | Yes |
| GET | `/api/leaderboard` | Get leaderboard | Yes |
| POST | `/api/seed` | Create demo data | No |

## 🧪 Test the Application

### Demo Accounts (after seeding):
- **Email:** `akshad@example.com` | **Password:** `password123`
- **Email:** `john@example.com` | **Password:** `password123`
- **Email:** `alice@example.com` | **Password:** `password123`

### Testing Flow:
1. Start backend server: `http://localhost:5000`
2. Start frontend: `http://localhost:3000`
3. Sign up for a new account or use demo credentials
4. Explore the dashboard and leaderboard features

## 📁 Project Structure

```
referral-dashboard/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── public/
```

## 🔧 Configuration

### Environment Variables (.env file):
```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
PORT=5000
```

### Frontend API Configuration:
Update the `API_BASE` constant in App.js if needed:
```javascript
const API_BASE = 'http://localhost:5000/api';
```

## 🎨 Customization

### Adding New Rewards:
1. Update the rewards array in the frontend
2. Modify the `getRewardStatus()` and `getNextReward()` functions
3. Update the rewards section in the dashboard

### Styling:
- The app uses Tailwind CSS classes
- Modify the gradient colors and styling in the React components
- Add custom CSS for additional styling

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Error**: Make sure backend is running on port 5000
2. **MongoDB Connection**: Check your connection string in .env
3. **JWT Errors**: Verify JWT_SECRET is set in .env
4. **Network Errors**: Ensure both frontend and backend are running

### Error Messages:
- "User already exists" → Email is already registered
- "Invalid credentials" → Wrong email/password combination
- "Access token required" → User needs to login again

## 📊 Demo Data

The seed endpoint creates 5 demo users with different donation amounts:
- Akshad Pastambh: ₹5,000 (all rewards unlocked)
- John Doe: ₹3,500 (2 rewards unlocked)
- Alice Smith: ₹2,800 (2 rewards unlocked)
- Bob Johnson: ₹1,500 (1 reward unlocked)
- Emma Wilson: ₹900 (no rewards unlocked)

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation
- CORS protection
- Secure password requirements

## 🚀 Deployment Ready

The application is ready for deployment on platforms like:
- **Backend**: Heroku, Railway, Render
- **Frontend**: Vercel, Netlify
- **Database**: MongoDB Atlas (already configured)

Remember to update environment variables and API endpoints for production!
