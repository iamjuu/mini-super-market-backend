import mongoose from 'mongoose';

const UnitSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  symbol: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// Sync status and isActive before saving
UnitSchema.pre('save', function () {
  if (this.isModified('isActive') && !this.isModified('status')) {
    this.status = this.isActive ? 'ACTIVE' : 'INACTIVE';
  } else if (this.isModified('status') && !this.isModified('isActive')) {
    this.isActive = this.status === 'ACTIVE';
  }
});

export const Unit = mongoose.model('Unit', UnitSchema);
export default Unit;
