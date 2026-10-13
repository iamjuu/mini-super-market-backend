import mongoose from 'mongoose';

const PlatformSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // 'appearance', 'settings', 'features'
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

export const PlatformSetting = mongoose.model('PlatformSetting', PlatformSettingSchema);
export default PlatformSetting;
