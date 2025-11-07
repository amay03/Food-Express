import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    foodName: { type: String, required: true, trim: true },
    userLocation: {
      pincode: { type: String, default: '' },
      city: { type: String, default: '' },
      address: { type: String, default: '' }
    },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, default: 'received', enum: ['received', 'preparing', 'out-for-delivery', 'delivered'] }
  },
  { timestamps: true, collection: 'orders' }
);

export default mongoose.model('Order', OrderSchema);



