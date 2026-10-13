import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const updateAdmin = async () => {
  try {
    await connectDB();

    const targetEmail = 'shamilalsalhya@gmail.com';
    const targetPassword = 'muh@mmedShamil3211';

    // 1. Delete old test admin a@gmail.com if present
    const deleteOld = await User.deleteMany({ email: 'a@gmail.com' });
    console.log(`Deleted old a@gmail.com accounts: ${deleteOld.deletedCount}`);

    // 2. Find or create shamilalsalhya@gmail.com
    let admin = await User.findOne({ email: targetEmail });

    if (!admin) {
      console.log(`Creating new admin account for ${targetEmail}...`);
      admin = new User({
        name: 'Shamil Al Salhiya Admin',
        email: targetEmail,
        password: targetPassword,
        phone: '+91 98765 43210',
        role: 'ADMIN',
        isUser: 'admin',
        status: 'ACTIVE',
        permissions: ['ALL', 'CATALOG_WRITE', 'DISPATCH_MANAGE', 'MERCHANTS_MANAGE', 'SYSTEM_GOVERNANCE'],
      });
      await admin.save();
    } else {
      console.log(`Existing user found for ${targetEmail}. Updating to Super Admin...`);
      admin.name = 'Shamil Al Salhiya Admin';
      admin.password = targetPassword;
      admin.role = 'ADMIN';
      admin.isUser = 'admin';
      admin.status = 'ACTIVE';
      admin.permissions = ['ALL', 'CATALOG_WRITE', 'DISPATCH_MANAGE', 'MERCHANTS_MANAGE', 'SYSTEM_GOVERNANCE'];
      await admin.save();
    }

    console.log(`\n🎉 Admin successfully configured in MongoDB Atlas!`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role} / ${admin.isUser}`);
    console.log(`Status: ${admin.status}`);

    const isMatch = await admin.comparePassword(targetPassword);
    console.log(`Password verification test passed: ${isMatch}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update admin:', err);
    process.exit(1);
  }
};

updateAdmin();
