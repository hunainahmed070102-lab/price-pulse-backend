const mongoose = require('mongoose');

module.exports = async (req, res) => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return res.json({ 
        success: true, 
        message: 'Already connected to MongoDB',
        readyState: mongoose.connection.readyState
      });
    }

    // Try to connect
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    res.json({ 
      success: true, 
      message: 'MongoDB connected successfully',
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code
    });
  }
};