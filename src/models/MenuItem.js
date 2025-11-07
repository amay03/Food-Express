import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'General' },
    imageUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('MenuItem', MenuItemSchema);



