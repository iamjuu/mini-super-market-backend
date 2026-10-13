import User from '../models/User.js';
import Unit from '../models/Unit.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import Shop from '../models/Shop.js';
import PlatformSetting from '../models/PlatformSetting.js';
import populateNewCatalog from './populateNewCatalog.js';

export const seedDatabaseIfEmpty = async () => {
  try {
    // 1. Ensure primary Administrator account: shamilalsalhya@gmail.com
    const adminEmail = process.env.ADMIN_EMAIL || 'shamilalsalhya@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'muh@mmedShamil3211';

    // Migrate old a@gmail.com account if exists
    let primaryAdmin = await User.findOne({ $or: [{ email: adminEmail }, { email: 'a@gmail.com' }] });
    if (!primaryAdmin) {
      primaryAdmin = new User({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        phone: '+91 98765 43210',
        role: 'ADMIN',
        isUser: 'admin',
        status: 'ACTIVE',
        permissions: ['ALL', 'CATALOG_WRITE', 'DISPATCH_MANAGE', 'MERCHANTS_MANAGE', 'SYSTEM_GOVERNANCE'],
      });
      await primaryAdmin.save();
      console.log(`✅ [Admin Account Created]: ${adminEmail}`);
    } else {
      primaryAdmin.email = adminEmail;
      primaryAdmin.password = adminPassword;
      primaryAdmin.role = 'ADMIN';
      primaryAdmin.isUser = 'admin';
      primaryAdmin.status = 'ACTIVE';
      primaryAdmin.permissions = ['ALL', 'CATALOG_WRITE', 'DISPATCH_MANAGE', 'MERCHANTS_MANAGE', 'SYSTEM_GOVERNANCE'];
      await primaryAdmin.save();
      console.log(`✅ [Admin Account Updated]: ${adminEmail}`);
    }

    // Seed Demo Customer if not present
    const demoCustomer = await User.findOne({ email: 'customer@alsalhiya.com' });
    if (!demoCustomer) {
      await User.create({
        name: 'Demo Customer',
        email: 'customer@alsalhiya.com',
        password: 'password123',
        phone: '+91 91234 56789',
        role: 'CUSTOMER',
        isUser: 'user',
        status: 'ACTIVE',
        addresses: [
          {
            street: 'Flat 402, Al Salhiya Heights, Main Bazaar Road',
            city: 'Malappuram',
            state: 'Kerala',
            pincode: '676505',
            tag: 'Home',
            isDefault: true,
          },
        ],
      });
    }

    // 2. Seed Units
    const unitCount = await Unit.countDocuments();
    let seededUnits = [];
    if (unitCount === 0) {
      console.log('🌱 [Seeding]: Creating standard measurement units...');
      seededUnits = await Unit.create([
        { name: 'Kilogram', symbol: 'kg', description: 'Mass for fresh vegetables, fruits, rice, meat', order: 1 },
        { name: 'Gram', symbol: 'g', description: 'Small mass for spices, seasonings and herbs', order: 2 },
        { name: 'Litre', symbol: 'litre', description: 'Volume for milk, cooking oils and juices', order: 3 },
        { name: 'Millilitre', symbol: 'ml', description: 'Volume for beverages and small liquids', order: 4 },
        { name: 'Piece', symbol: 'piece', description: 'Single countable item (whole bird, fish, fruit)', order: 5 },
        { name: 'Pack', symbol: 'pack', description: 'Sealed packet or bundle', order: 6 },
        { name: 'Dozen', symbol: 'dozen', description: 'Set of 12 items (eggs, bananas)', order: 7 },
        { name: 'Box', symbol: 'box', description: 'Box packaging', order: 8 },
      ]);
    } else {
      seededUnits = await Unit.find();
    }

    // 3. Seed Categories
    const categoryCount = await Category.countDocuments();
    let seededCategories = [];
    if (categoryCount === 0) {
      console.log('🌱 [Seeding]: Creating default product departments...');
      seededCategories = await Category.create([
        {
          name: 'Fresh Vegetables',
          slug: 'fresh-vegetables',
          description: 'Farm-fresh organic daily greens, root veggies & seasonal picks',
          icon: 'Carrot',
          image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
          deliveryPrice: 25,
          order: 1,
        },
        {
          name: 'Fresh Chicken & Poultry',
          slug: 'fresh-chicken-poultry',
          description: 'Hygienic 100% Halal fresh chicken cuts, tender farm poultry',
          icon: 'Beef',
          image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=80',
          deliveryPrice: 35,
          order: 2,
        },
        {
          name: 'Wild Fish & Seafood',
          slug: 'wild-fish-seafood',
          description: 'Daily fresh catch ocean marine fishes, prawns & clean cuts',
          icon: 'Fish',
          image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&auto=format&fit=crop&q=80',
          deliveryPrice: 40,
          order: 3,
        },
        {
          name: 'Dairy, Milk & Eggs',
          slug: 'dairy-milk-eggs',
          description: 'Fresh dairy milk, country eggs, pure bilona ghee & farm paneer',
          icon: 'Egg',
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
          deliveryPrice: 20,
          order: 4,
        },
        {
          name: 'Daily Grocery & Staples',
          slug: 'daily-grocery-staples',
          description: 'Premium basmati rice, organic pulses, cooking oils & pantry spices',
          icon: 'Boxes',
          image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=600&auto=format&fit=crop&q=80',
          deliveryPrice: 30,
          order: 5,
        },
      ]);
    } else {
      seededCategories = await Category.find();
    }

    // 4. Seed Subcategories
    const subcategoryCount = await Subcategory.countDocuments();
    let seededSubcategories = [];
    if (subcategoryCount === 0 && seededCategories.length > 0) {
      console.log('🌱 [Seeding]: Creating nested aisles (subcategories)...');
      const vegCat = seededCategories.find((c) => c.slug === 'fresh-vegetables') || seededCategories[0];
      const chickenCat = seededCategories.find((c) => c.slug === 'fresh-chicken-poultry') || seededCategories[1];
      const fishCat = seededCategories.find((c) => c.slug === 'wild-fish-seafood') || seededCategories[2];
      const dairyCat = seededCategories.find((c) => c.slug === 'dairy-milk-eggs') || seededCategories[3];
      const groceryCat = seededCategories.find((c) => c.slug === 'daily-grocery-staples') || seededCategories[4];

      const kgUnit = seededUnits.find((u) => u.symbol === 'kg');
      const gUnit = seededUnits.find((u) => u.symbol === 'g');
      const litreUnit = seededUnits.find((u) => u.symbol === 'litre');
      const pieceUnit = seededUnits.find((u) => u.symbol === 'piece');
      const packUnit = seededUnits.find((u) => u.symbol === 'pack');

      const allowedMass = [kgUnit?._id, gUnit?._id].filter(Boolean);
      const allowedPieces = [pieceUnit?._id, packUnit?._id].filter(Boolean);
      const allowedVolume = [litreUnit?._id, packUnit?._id].filter(Boolean);

      seededSubcategories = await Subcategory.create([
        {
          name: 'Fresh Farm Produce',
          slug: 'fresh-farm-produce',
          categoryId: vegCat._id,
          allowedUnitIds: allowedMass,
          description: 'Tomatoes, onions, potatoes and root greens',
        },
        {
          name: 'Leafy Vegetables & Herbs',
          slug: 'leafy-vegetables-herbs',
          categoryId: vegCat._id,
          allowedUnitIds: allowedPieces,
          description: 'Spinach, coriander, mint and fresh greens',
        },
        {
          name: 'Curry Cuts & Boneless',
          slug: 'curry-cuts-boneless',
          categoryId: chickenCat._id,
          allowedUnitIds: allowedMass,
          description: 'Clean skinless chicken curry cuts and boneless cubes',
        },
        {
          name: 'Whole Birds & Drumsticks',
          slug: 'whole-birds-drumsticks',
          categoryId: chickenCat._id,
          allowedUnitIds: allowedMass,
          description: 'Juicy chicken drumsticks and tender whole dressed poultry',
        },
        {
          name: 'Coastal Sea Fishes',
          slug: 'coastal-sea-fishes',
          categoryId: fishCat._id,
          allowedUnitIds: allowedMass,
          description: 'Kingfish, pomfret, seer fish, and mackerel slices',
        },
        {
          name: 'Fresh Prawns & Shellfish',
          slug: 'fresh-prawns-shellfish',
          categoryId: fishCat._id,
          allowedUnitIds: allowedMass,
          description: 'Ocean medium tiger prawns, cleaned and deveined',
        },
        {
          name: 'Farm Fresh Milk & Paneer',
          slug: 'farm-fresh-milk-paneer',
          categoryId: dairyCat._id,
          allowedUnitIds: allowedVolume,
          description: 'Pasteurized whole milk, curd and malai paneer',
        },
        {
          name: 'Basmati Rice & Grains',
          slug: 'basmati-rice-grains',
          categoryId: groceryCat._id,
          allowedUnitIds: allowedMass,
          description: 'Aged royal basmati rice and wholesome wheat flour',
        },
      ]);
    } else {
      seededSubcategories = await Subcategory.find();
    }

    // 5. Seed Brands
    const brandCount = await Brand.countDocuments();
    let seededBrands = [];
    if (brandCount === 0 && seededCategories.length > 0) {
      console.log('🌱 [Seeding]: Creating manufacturer brand registry...');
      seededBrands = await Brand.create([
        {
          name: 'Farm Fresh Organics',
          slug: 'farm-fresh-organics',
          categoryId: seededCategories[0]._id,
          logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
          description: 'Direct organic farm collective harvest',
        },
        {
          name: 'Poultry Pride',
          slug: 'poultry-pride',
          categoryId: seededCategories[1]?._id || seededCategories[0]._id,
          logo: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200&auto=format&fit=crop&q=80',
          description: 'Hygienic cage-free 100% halal poultry producer',
        },
        {
          name: 'Ocean Catch Seafood',
          slug: 'ocean-catch-seafood',
          categoryId: seededCategories[2]?._id || seededCategories[0]._id,
          logo: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=200&auto=format&fit=crop&q=80',
          description: 'Daily coastal deep-sea fisherman harvest',
        },
        {
          name: 'Royal Heritage Dairy',
          slug: 'royal-heritage-dairy',
          categoryId: seededCategories[3]?._id || seededCategories[0]._id,
          logo: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=80',
          description: 'Traditional bilona churning and pure organic cow dairy',
        },
        {
          name: 'Al Salhiya Select',
          slug: 'al-salhiya-select',
          categoryId: seededCategories[4]?._id || seededCategories[0]._id,
          logo: '/al-salhiya-logo.jpg',
          description: 'Signature in-house curated supermarket staples',
        },
      ]);
    } else {
      seededBrands = await Brand.find();
    }

    // 6. Seed Shop
    const shopCount = await Shop.countDocuments();
    let seededShop = null;
    if (shopCount === 0) {
      console.log('🌱 [Seeding]: Creating flagship Al Salhiya Supermarket branch...');
      const admin = await User.findOne({ role: 'ADMIN' });
      seededShop = await Shop.create({
        name: 'Al Salhiya Supermarket — Main Branch',
        slug: 'al-salhiya-main-branch',
        owner: admin?._id,
        ownerEmail: admin?.email || 'admin@alsalhiya.com',
        category: 'Hypermarket & Gourmet Food',
        phone: '+91 98765 43210',
        openingTime: '07:00 AM',
        closingTime: '10:30 PM',
        image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
        address: {
          street: 'Al Salhiya Commercial Center, Central Town Bypass',
          city: 'Malappuram',
          state: 'Kerala',
          pincode: '676505',
          lat: 11.051,
          lng: 76.0711,
        },
        rating: 4.9,
        status: 'ACTIVE',
      });
    } else {
      seededShop = await Shop.findOne();
    }

    // 7. Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0 && seededCategories.length > 0) {
      console.log('🌱 [Seeding]: Creating master products...');
      const catVeg = seededCategories.find((c) => c.slug === 'fresh-vegetables') || seededCategories[0];
      const catChicken = seededCategories.find((c) => c.slug === 'fresh-chicken-poultry') || seededCategories[1];
      const catFish = seededCategories.find((c) => c.slug === 'wild-fish-seafood') || seededCategories[2];
      const catDairy = seededCategories.find((c) => c.slug === 'dairy-milk-eggs') || seededCategories[3];
      const catGrocery = seededCategories.find((c) => c.slug === 'daily-grocery-staples') || seededCategories[4];

      const subVeg = seededSubcategories.find((s) => s.slug === 'fresh-farm-produce') || seededSubcategories[0];
      const subChicken = seededSubcategories.find((s) => s.slug === 'curry-cuts-boneless') || seededSubcategories[1];
      const subFish = seededSubcategories.find((s) => s.slug === 'coastal-sea-fishes') || seededSubcategories[2];
      const subDairy = seededSubcategories.find((s) => s.slug === 'farm-fresh-milk-paneer') || seededSubcategories[3];
      const subGrocery = seededSubcategories.find((s) => s.slug === 'basmati-rice-grains') || seededSubcategories[4];

      const bFarm = seededBrands.find((b) => b.slug === 'farm-fresh-organics') || seededBrands[0];
      const bPoultry = seededBrands.find((b) => b.slug === 'poultry-pride') || seededBrands[1];
      const bOcean = seededBrands.find((b) => b.slug === 'ocean-catch-seafood') || seededBrands[2];
      const bDairy = seededBrands.find((b) => b.slug === 'royal-heritage-dairy') || seededBrands[3];
      const bSalhiya = seededBrands.find((b) => b.slug === 'al-salhiya-select') || seededBrands[4];

      await Product.create([
        {
          name: 'Fresh Farm Apples (Kashmiri Royal)',
          slug: 'fresh-farm-apples-kashmiri-royal',
          categoryId: catVeg._id,
          categoryName: catVeg.name,
          subcategoryId: subVeg?._id,
          subcategoryName: subVeg?.name,
          brandId: bFarm?._id,
          brandName: bFarm?.name,
          price: 69,
          mrp: 120,
          originalPrice: 120,
          unit: '1 kg',
          description: 'Crisp organic Kashmiri red apples, handpicked farm fresh.',
          image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80',
          images: [
            'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80',
          ],
          isBestOffer: true,
          deliveryPrice: 25,
          shopId: seededShop?._id,
        },
        {
          name: 'Farm Fresh Whole Chicken (Clean Cut)',
          slug: 'farm-fresh-whole-chicken-clean-cut',
          categoryId: catChicken._id,
          categoryName: catChicken.name,
          subcategoryId: subChicken?._id,
          subcategoryName: subChicken?.name,
          brandId: bPoultry?._id,
          brandName: bPoultry?.name,
          price: 159,
          mrp: 220,
          originalPrice: 220,
          unit: '1 kg',
          description: 'Antibiotic-free fresh whole chicken cuts, cleaned, gutted & hygienically vacuum sealed.',
          image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=80',
          images: [
            'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=80',
          ],
          isBestOffer: true,
          deliveryPrice: 35,
          shopId: seededShop?._id,
        },
        {
          name: 'Pure Desi Cow Ghee (Bilona Churned)',
          slug: 'pure-desi-cow-ghee-bilona-churned',
          categoryId: catDairy._id,
          categoryName: catDairy.name,
          subcategoryId: subDairy?._id,
          subcategoryName: subDairy?.name,
          brandId: bDairy?._id,
          brandName: bDairy?.name,
          price: 349,
          mrp: 480,
          originalPrice: 480,
          unit: '500 ml',
          description: 'Traditional bilona churned pure cow ghee packed in airtight glass jars.',
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
          images: [
            'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
          ],
          isBestOffer: true,
          deliveryPrice: 20,
          shopId: seededShop?._id,
        },
        {
          name: 'Wild Ocean Sardines & Mackerel (Daily Catch)',
          slug: 'wild-ocean-sardines-mackerel-daily-catch',
          categoryId: catFish._id,
          categoryName: catFish.name,
          subcategoryId: subFish?._id,
          subcategoryName: subFish?.name,
          brandId: bOcean?._id,
          brandName: bOcean?.name,
          price: 119,
          mrp: 180,
          originalPrice: 180,
          unit: '1 kg',
          description: 'Daily coastal ocean catch, cleaned and gutted for cooking.',
          image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=80',
          images: [
            'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=80',
          ],
          isBestOffer: true,
          deliveryPrice: 40,
          shopId: seededShop?._id,
        },
        {
          name: 'Aged Royal Basmati Rice (Extra Long Grain)',
          slug: 'aged-royal-basmati-rice-extra-long-grain',
          categoryId: catGrocery._id,
          categoryName: catGrocery.name,
          subcategoryId: subGrocery?._id,
          subcategoryName: subGrocery?.name,
          brandId: bSalhiya?._id,
          brandName: bSalhiya?.name,
          price: 199,
          mrp: 260,
          originalPrice: 260,
          unit: '1 kg',
          description: '2-year aged aromatic extra-long grain Himalayan basmati rice.',
          image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=500&auto=format&fit=crop&q=80',
          images: [
            'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=500&auto=format&fit=crop&q=80',
          ],
          isBestOffer: false,
          deliveryPrice: 30,
          shopId: seededShop?._id,
        },
        {
          name: 'Farm Fresh Roma Tomatoes',
          slug: 'farm-fresh-roma-tomatoes',
          categoryId: catVeg._id,
          categoryName: catVeg.name,
          subcategoryId: subVeg?._id,
          subcategoryName: subVeg?.name,
          brandId: bFarm?._id,
          brandName: bFarm?.name,
          price: 38,
          mrp: 55,
          originalPrice: 55,
          unit: '1 kg',
          description: 'Sun-ripened organic red salad tomatoes.',
          image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
          images: [
            'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
          ],
          isBestOffer: false,
          deliveryPrice: 25,
          shopId: seededShop?._id,
        },
      ]);
    }

    // 8. Seed Offers
    const offerCount = await Offer.countDocuments();
    if (offerCount === 0) {
      console.log('🌱 [Seeding]: Creating storefront promotional deals...');
      await Offer.create([
        {
          title: 'Fresh Farm Apples',
          description: 'Crisp organic Kashmiri red apples, handpicked farm fresh',
          actualPrice: 120,
          offerPrice: 69,
          image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80',
          tagBadge: '⭐ Deal of the Day',
          isActive: true,
          order: 1,
        },
        {
          title: 'Tender Fresh Poultry',
          description: 'Antibiotic-free fresh whole chicken cuts, cleaned & packed',
          actualPrice: 220,
          offerPrice: 159,
          image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=80',
          tagBadge: '⚡ Flash Sale -28%',
          isActive: true,
          order: 2,
        },
        {
          title: 'Pure Desi Cow Ghee',
          description: 'Traditional bilona churned pure cow ghee in glass jar',
          actualPrice: 480,
          offerPrice: 349,
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
          tagBadge: '🔥 Save ₹131 Today',
          isActive: true,
          order: 3,
        },
        {
          title: 'Fresh Marine Sardines',
          description: 'Daily coastal ocean catch, cleaned and gutted for cooking',
          actualPrice: 180,
          offerPrice: 119,
          image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=80',
          tagBadge: '🐟 Ocean Catch -34%',
          isActive: true,
          order: 4,
        },
      ]);
    }

    // 9. Seed Platform Settings
    const settingCount = await PlatformSetting.countDocuments();
    if (settingCount === 0) {
      console.log('🌱 [Seeding]: Initializing platform settings and theme...');
      await PlatformSetting.create([
        {
          key: 'appearance',
          data: {
            platformName: 'Al Salhiya',
            tagline: 'Premium Quality Foods & Products — عالية الجودة',
            logoUrl: '/al-salhiya-logo.jpg',
            primaryThemeColor: '#18308c',
            secondaryThemeColor: '#ff7824',
            accentGold: '#ffba18',
            primaryHover: '#18308ce6',
            primaryLight: '#18308c1a',
          },
        },
        {
          key: 'settings',
          data: {
            openingTime: '07:00 AM',
            closingTime: '10:00 PM',
            timezone: 'Asia/Kolkata',
            acceptOrdersGlobally: true,
            baseDeliveryFee: 30,
            freeDeliveryThreshold: 499,
            commissionPercentage: 10,
          },
        },
        {
          key: 'features',
          data: {
            customer_wallet: true,
            live_gps_broadcasting: true,
            razorpay_gateway: true,
            continuous_audio_alarm: true,
            doorstep_otp_required: true,
            alternative_procurement: true,
            shop_owner_portal: true,
          },
        },
      ]);
    }

    // Also ensure the 4 extended categories, subcategories, brands, grocery powders, and banners are seeded
    await populateNewCatalog();

    console.log('✨ [Database Seeding Complete]: All collections ready.');
  } catch (err) {
    console.error('⚠️ [Seeding Error]:', err);
  }
};

export default seedDatabaseIfEmpty;
