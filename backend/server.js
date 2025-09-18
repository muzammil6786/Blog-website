const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(" MongoDB connected");
    } catch (err) {
        console.error(" Failed to connect MongoDB:", err.message);
        process.exit(1); // Exit if DB connection fails
    }
};

connectDB();

app.use('/api/blogs', blogRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
