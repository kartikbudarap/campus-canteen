const mongoose = require('mongoose');

require('dotenv').config()

const dbConnect = ()=>{
    const mongoUri =
        process.env.MONGO_URL ||
        process.env.MONGODB_URI ||
        process.env.DATABASE_URL ||
        'mongodb://localhost:27017/e-canteen';

    mongoose.connect(mongoUri)
    .then(()=>{
        console.log('MongoDB Connected successfully');
    })
    .catch((error)=>{
        console.error('MongoDB Connection Error:', error.message);
        process.exit(1);
    })
}

module.exports = dbConnect;