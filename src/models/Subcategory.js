import mongoose from 'mongoose';

const SubcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, default: '' },
  allowedUnitIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' }],
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
}, { timestamps: true });

SubcategorySchema.pre('save', function () {
  if (this.isModified('isActive') && !this.isModified('status')) {
    this.status = this.isActive ? 'ACTIVE' : 'INACTIVE';
  } else if (this.isModified('status') && !this.isModified('isActive')) {
    this.isActive = this.status === 'ACTIVE';
  }
});

export const Subcategory = mongoose.model('Subcategory', SubcategorySchema);
export default Subcategory;
