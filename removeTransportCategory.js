const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const removeTransportProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove all products with transport category
    const result = await Product.deleteMany({ category: 'transport' });
    console.log(`Removed ${result.deletedCount} products with transport category`);

    // Update any remaining products with transport category to a different category
    const updateResult = await Product.updateMany(
      { category: /transport/i },
      { $set: { category: 'grocery' } }
    );
    console.log(`Updated ${updateResult.modifiedCount} products from transport to grocery`);

    await mongoose.connection.close();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

removeTransportProducts();
