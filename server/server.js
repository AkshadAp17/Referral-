const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/referral_dashboard';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    referralCode: { type: String, unique: true },
    donationsRaised: { type: Number, default: 0 },
    joiningDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Generate referral code before saving
userSchema.pre('save', function(next) {
    if (!this.referralCode) {
        const nameCode = this.name.toLowerCase().replace(/\s+/g, '');
        this.referralCode = `${nameCode}2025`;
    }
    next();
});

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Sign Up
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            donationsRaised: Math.floor(Math.random() * 5000) // Random initial amount for demo
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                referralCode: user.referralCode,
                donationsRaised: user.donationsRaised
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                referralCode: user.referralCode,
                donationsRaised: user.donationsRaised
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user dashboard data
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            name: user.name,
            email: user.email,
            referralCode: user.referralCode,
            donationsRaised: user.donationsRaised,
            joiningDate: user.joiningDate
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get leaderboard
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
    try {
        const users = await User.find()
            .select('name referralCode donationsRaised')
            .sort({ donationsRaised: -1 })
            .limit(10);

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            name: user.name,
            referralCode: user.referralCode,
            donationsRaised: user.donationsRaised
        }));

        res.json(leaderboard);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update donation amount (for testing purposes)
app.put('/api/donations', authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;
        
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.donationsRaised += amount;
        await user.save();

        res.json({
            message: 'Donation amount updated',
            donationsRaised: user.donationsRaised
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Seed some demo data (run once)
app.post('/api/seed', async (req, res) => {
    try {
        // Check if users already exist
        const existingUsers = await User.countDocuments();
        if (existingUsers > 0) {
            return res.json({ message: 'Demo data already exists' });
        }

        // Create demo users
        const demoUsers = [
            {
                name: 'Akshad Pastambh',
                email: 'akshad@example.com',
                password: await bcrypt.hash('password123', 10),
                donationsRaised: 5000
            },
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: await bcrypt.hash('password123', 10),
                donationsRaised: 3500
            },
            {
                name: 'Alice Smith',
                email: 'alice@example.com',
                password: await bcrypt.hash('password123', 10),
                donationsRaised: 2800
            },
            {
                name: 'Bob Johnson',
                email: 'bob@example.com',
                password: await bcrypt.hash('password123', 10),
                donationsRaised: 1500
            },
            {
                name: 'Emma Wilson',
                email: 'emma@example.com',
                password: await bcrypt.hash('password123', 10),
                donationsRaised: 900
            }
        ];

        await User.insertMany(demoUsers);
        res.json({ message: 'Demo data created successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('POST /api/signup - Create new user');
    console.log('POST /api/login - User login');
    console.log('GET /api/dashboard - Get user dashboard data');
    console.log('GET /api/leaderboard - Get leaderboard');
    console.log('POST /api/seed - Create demo data (run once)');
});