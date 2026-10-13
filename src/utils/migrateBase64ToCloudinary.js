import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Offer from '../models/Offer.js';

const migrateBase64Images = async () => {
  try {
    await connectDB();
    console.log('🔄 Starting migration of raw base64 images to Cloudinary...\n');

    // 1. Brands
    const base64Brands = await Brand.find({ logo: { $regex: '^data:image' } });
    console.log(`Found ${base64Brands.length} brands with raw base64 logos.`);
    for (const b of base64Brands) {
      console.log(` Uploading brand logo: "${b.name}"...`);
      const uploadRes = await uploadToCloudinary(b.logo, 'shamil_marketplace/brands');
      b.logo = uploadRes.url;
      await b.save();
      console.log(` ✅ Brand "${b.name}" updated with: ${uploadRes.url}`);
    }

    // 2. Products
    const base64Products = await Product.find({
      $or: [
        { image: { $regex: '^data:image' } },
        { images: { $elemMatch: { $regex: '^data:image' } } },
      ],
    });
    console.log(`\nFound ${base64Products.length} products with raw base64 images.`);
    for (const p of base64Products) {
      console.log(` Uploading product image: "${p.name}"...`);
      if (p.image && p.image.startsWith('data:image')) {
        const uploadRes = await uploadToCloudinary(p.image, 'shamil_marketplace/products');
        p.image = uploadRes.url;
      }
      if (p.images && Array.isArray(p.images)) {
        for (let i = 0; i < p.images.length; i++) {
          if (p.images[i] && p.images[i].startsWith('data:image')) {
            const uploadRes = await uploadToCloudinary(p.images[i], 'shamil_marketplace/products');
            p.images[i] = uploadRes.url;
          }
        }
      }
      await p.save();
      console.log(` ✅ Product "${p.name}" updated with Cloudinary URL.`);
    }

    // 3. Categories
    const base64Categories = await Category.find({ image: { $regex: '^data:image' } });
    console.log(`\nFound ${base64Categories.length} categories with raw base64 images.`);
    for (const c of base64Categories) {
      console.log(` Uploading category image: "${c.name}"...`);
      const uploadRes = await uploadToCloudinary(c.image, 'shamil_marketplace/categories');
      c.image = uploadRes.url;
      await c.save();
      console.log(` ✅ Category "${c.name}" updated.`);
    }

    // 4. Offers
    const base64Offers = await Offer.find({ image: { $regex: '^data:image' } });
    console.log(`\nFound ${base64Offers.length} offers with raw base64 images.`);
    for (const o of base64Offers) {
      console.log(` Uploading offer image: "${o.title}"...`);
      const uploadRes = await uploadToCloudinary(o.image, 'shamil_marketplace/offers');
      o.image = uploadRes.url;
      await o.save();
      console.log(` ✅ Offer "${o.title}" updated.`);
    }

    console.log('\n🎉 All raw base64 images successfully compressed and uploaded to Cloudinary!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
};

migrateBase64Images();
