import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import Unit from '../models/Unit.js';
import Shop from '../models/Shop.js';

dotenv.config();

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const populateNewCatalog = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shamil_db';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri);
    }
    console.log('🍃 Connected to MongoDB for Catalog Population...');

    // Get units
    const kgUnit = await Unit.findOne({ symbol: 'kg' });
    const gUnit = await Unit.findOne({ symbol: 'g' });
    const packUnit = await Unit.findOne({ symbol: 'pack' });
    const pieceUnit = await Unit.findOne({ symbol: 'piece' });

    const allowedPowderUnits = [gUnit?._id, kgUnit?._id, packUnit?._id].filter(Boolean);

    // Get flagship shop
    const shop = await Shop.findOne();

    // =========================================================================
    // 1. ADD 4 CATEGORIES
    // =========================================================================
    const categoriesData = [
      {
        name: 'Spices & Masala Powders',
        slug: 'spices-masala-powders',
        description: 'Pure aromatic culinary spice powders, chilli, turmeric & authentic seasonings',
        icon: 'Flame',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
        deliveryPrice: 25,
        order: 6,
      },
      {
        name: 'Sugars, Salts & Sweeteners',
        slug: 'sugars-salts-sweeteners',
        description: 'Pure sulphur-free white crystal sugar, brown sugar, organic jaggery & rock salts',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600&auto=format&fit=crop&q=80',
        deliveryPrice: 25,
        order: 7,
      },
      {
        name: 'Flours, Atta & Grains',
        slug: 'flours-atta-grains',
        description: '100% whole wheat chakki fresh atta, maida, besan gram flour & specialty rice powders',
        icon: 'Cookie',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
        deliveryPrice: 30,
        order: 8,
      },
      {
        name: 'Beverages & Tea Powders',
        slug: 'beverages-tea-powders',
        description: 'Strong Assam CTC tea dust, aromatic chai blends, filter coffee & roasted granules',
        icon: 'Coffee',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
        deliveryPrice: 20,
        order: 9,
      },
    ];

    const savedCategories = {};
    for (const catData of categoriesData) {
      let cat = await Category.findOne({ slug: catData.slug });
      if (!cat) {
        cat = await Category.create(catData);
        console.log(`✅ Category created: ${cat.name}`);
      } else {
        cat.image = catData.image;
        cat.description = catData.description;
        await cat.save();
        console.log(`ℹ️ Category updated: ${cat.name}`);
      }
      savedCategories[cat.slug] = cat;
    }

    // =========================================================================
    // 2. ADD 2 SUBCATEGORIES FOR EACH OF THE 4 CATEGORIES (TOTAL 8 SUBCATEGORIES)
    // =========================================================================
    const subcategoriesData = [
      // For Spices & Masala Powders (2 Subcategories)
      {
        name: 'Pure Ground Spice Powders',
        slug: 'pure-ground-spice-powders',
        categorySlug: 'spices-masala-powders',
        description: 'Finely ground red chilli powder, turmeric, coriander & pepper powders',
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
        allowedUnitIds: allowedPowderUnits,
      },
      {
        name: 'Traditional Masalas & Blends',
        slug: 'traditional-masalas-blends',
        categorySlug: 'spices-masala-powders',
        description: 'Kitchen king garam masala, sambar powder, meat masala & curry blends',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
        allowedUnitIds: allowedPowderUnits,
      },

      // For Sugars, Salts & Sweeteners (2 Subcategories)
      {
        name: 'Refined & Brown Sugars',
        slug: 'refined-brown-sugars',
        categorySlug: 'sugars-salts-sweeteners',
        description: 'Crystal white sugar, raw unrefined brown cane sugar & sugar cubes',
        image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&auto=format&fit=crop&q=80',
        allowedUnitIds: allowedPowderUnits,
      },
      {
        name: 'Organic Jaggery & Mineral Salts',
        slug: 'organic-jaggery-mineral-salts',
        categorySlug: 'sugars-salts-sweeteners',
        description: 'Traditional palm jaggery powder (gud), rock salt & iodized table salt',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
        allowedUnitIds: allowedPowderUnits,
      },

      // For Flours, Atta & Grains (2 Subcategories)
      {
        name: 'Whole Wheat Atta & Maida',
        slug: 'whole-wheat-atta-maida',
        categorySlug: 'flours-atta-grains',
        description: 'Stone-ground chakki fresh wheat atta, multi-grain flour & refined maida',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
        allowedUnitIds: allowedPowderUnits,
      },
      {
        name: 'Specialty Powders & Besan',
        slug: 'specialty-powders-besan',
        categorySlug: 'flours-atta-grains',
        description: 'Pure Bengal gram besan powder, roasted rice puttu podi & idiyappam flour',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
        allowedUnitIds: allowedPowderUnits,
      },

      // For Beverages & Tea Powders (2 Subcategories)
      {
        name: 'Tea Dust & Leaf Blends',
        slug: 'tea-dust-leaf-blends',
        categorySlug: 'beverages-tea-powders',
        description: 'Strong Assam CTC tea dust, cardamom spiced tea & Darjeeling leaf',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
        allowedUnitIds: allowedPowderUnits,
      },
      {
        name: 'Filter Coffee & Cocoa Powders',
        slug: 'filter-coffee-cocoa-powders',
        categorySlug: 'beverages-tea-powders',
        description: 'Authentic South Indian roasted filter coffee, chicory blends & drinking cocoa',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
        allowedUnitIds: allowedPowderUnits,
      },
    ];

    const savedSubcategories = {};
    for (const subData of subcategoriesData) {
      const parentCat = savedCategories[subData.categorySlug];
      if (!parentCat) continue;

      let sub = await Subcategory.findOne({ slug: subData.slug });
      if (!sub) {
        sub = await Subcategory.create({
          name: subData.name,
          slug: subData.slug,
          categoryId: parentCat._id,
          description: subData.description,
          image: subData.image,
          allowedUnitIds: subData.allowedUnitIds,
          isActive: true,
          status: 'ACTIVE',
        });
        console.log(`✅ Subcategory created: ${sub.name} (Parent: ${parentCat.name})`);
      } else {
        sub.categoryId = parentCat._id;
        sub.image = subData.image;
        sub.description = subData.description;
        await sub.save();
        console.log(`ℹ️ Subcategory updated: ${sub.name}`);
      }
      savedSubcategories[sub.slug] = sub;
    }

    // =========================================================================
    // 3. ADD BRANDS
    // =========================================================================
    const brandsData = [
      {
        name: 'Eastern Condiments',
        slug: 'eastern-condiments',
        categorySlug: 'spices-masala-powders',
        logo: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200&auto=format&fit=crop&q=80',
        description: 'Pioneers of pure spices, ground chilli & authentic curry powders',
      },
      {
        name: 'Everest Spices',
        slug: 'everest-spices',
        categorySlug: 'spices-masala-powders',
        logo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&auto=format&fit=crop&q=80',
        description: 'India’s largest spice brand — pure aroma and curcumin rich blends',
      },
      {
        name: 'Madhur Pure Sugar',
        slug: 'madhur-pure-sugar',
        categorySlug: 'sugars-salts-sweeteners',
        logo: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=200&auto=format&fit=crop&q=80',
        description: 'Untouched by hand, 100% sulphur-free sparkling crystal white sugar',
      },
      {
        name: 'Tata Salt & Sampann',
        slug: 'tata-salt-sampann',
        categorySlug: 'sugars-salts-sweeteners',
        logo: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80',
        description: 'Desh Ka Namak — pure iodized salt, pink rock salt & organic sweeteners',
      },
      {
        name: 'Aashirvaad Grains',
        slug: 'aashirvaad-grains',
        categorySlug: 'flours-atta-grains',
        logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80',
        description: '100% MP Sharbati whole wheat chakki fresh atta with natural dietary fiber',
      },
      {
        name: 'Nirapara Traditional Foods',
        slug: 'nirapara-traditional-foods',
        categorySlug: 'flours-atta-grains',
        logo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=80',
        description: 'Traditional roasted rice powders, puttu podi, appam & idiyappam flours',
      },
      {
        name: 'Red Label & Taj Mahal Tea',
        slug: 'red-label-taj-mahal-tea',
        categorySlug: 'beverages-tea-powders',
        logo: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&auto=format&fit=crop&q=80',
        description: 'Rich Assam CTC tea leaves & dust with extraordinary warmth and strength',
      },
      {
        name: 'Bru & Continental Coffee',
        slug: 'bru-continental-coffee',
        categorySlug: 'beverages-tea-powders',
        logo: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80',
        description: 'Fresh roasted South Indian plantation coffee beans with chicory notes',
      },
    ];

    const savedBrands = {};
    for (const brandData of brandsData) {
      const parentCat = savedCategories[brandData.categorySlug];
      let brand = await Brand.findOne({ slug: brandData.slug });
      if (!brand) {
        brand = await Brand.create({
          name: brandData.name,
          slug: brandData.slug,
          categoryId: parentCat?._id || null,
          logo: brandData.logo,
          description: brandData.description,
          isActive: true,
          status: 'ACTIVE',
        });
        console.log(`✅ Brand registered: ${brand.name}`);
      } else {
        brand.categoryId = parentCat?._id || brand.categoryId;
        brand.logo = brandData.logo;
        await brand.save();
        console.log(`ℹ️ Brand updated: ${brand.name}`);
      }
      savedBrands[brand.slug] = brand;
    }

    // =========================================================================
    // 4. ADD PRODUCTS (POWDERS: CHILLI, SUGAR, GROCERY ITEMS)
    // =========================================================================
    const productsData = [
      // 1. Chilli Powder
      {
        name: 'Kashmiri Red Chilli Powder (100% Sun-Dried)',
        slug: 'kashmiri-red-chilli-powder-sun-dried',
        categorySlug: 'spices-masala-powders',
        subcategorySlug: 'pure-ground-spice-powders',
        brandSlug: 'eastern-condiments',
        price: 68,
        mrp: 95,
        unit: '500 g',
        description: 'Vibrant natural red color with mild aromatic pungency. Free from artificial colors.',
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
        ],
        isBestOffer: true,
        deliveryPrice: 25,
      },
      // 2. Turmeric Powder
      {
        name: 'Pure Golden Turmeric Powder (Curcumin Rich)',
        slug: 'pure-golden-turmeric-powder-curcumin-rich',
        categorySlug: 'spices-masala-powders',
        subcategorySlug: 'pure-ground-spice-powders',
        brandSlug: 'everest-spices',
        price: 45,
        mrp: 65,
        unit: '250 g',
        description: 'High curcumin potency Salem turmeric powder, stone crushed for natural antiseptic benefits.',
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
        ],
        isBestOffer: true,
        deliveryPrice: 25,
      },
      // 3. Coriander Powder
      {
        name: 'Roasted Coriander Powder (Dhaniya Powder)',
        slug: 'roasted-coriander-powder-dhaniya',
        categorySlug: 'spices-masala-powders',
        subcategorySlug: 'pure-ground-spice-powders',
        brandSlug: 'eastern-condiments',
        price: 52,
        mrp: 72,
        unit: '500 g',
        description: 'Slow roasted whole green coriander seeds ground to fine aromatic culinary perfection.',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
        ],
        isBestOffer: false,
        deliveryPrice: 25,
      },
      // 4. Garam Masala
      {
        name: 'Royal Garam Masala Blend (Aromatic 16-Spice)',
        slug: 'royal-garam-masala-blend-16-spice',
        categorySlug: 'spices-masala-powders',
        subcategorySlug: 'traditional-masalas-blends',
        brandSlug: 'everest-spices',
        price: 85,
        mrp: 115,
        unit: '100 g',
        description: 'Master chef secret blend of mace, nutmeg, star anise, cinnamon & royal cloves.',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
        ],
        isBestOffer: true,
        deliveryPrice: 25,
      },
      // 5. White Sugar
      {
        name: 'Premium Refined Crystal Sugar (Sulphur-Free)',
        slug: 'premium-refined-crystal-sugar-sulphur-free',
        categorySlug: 'sugars-salts-sweeteners',
        subcategorySlug: 'refined-brown-sugars',
        brandSlug: 'madhur-pure-sugar',
        price: 48,
        mrp: 60,
        unit: '1 kg',
        description: 'Sparkling crystal white sugar, processed untouched by hands using sulphur-free technology.',
        image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&auto=format&fit=crop&q=80',
        ],
        isBestOffer: true,
        deliveryPrice: 25,
      },
      // 6. Brown Sugar
      {
        name: 'Organic Golden Brown Cane Sugar (Unrefined)',
        slug: 'organic-golden-brown-cane-sugar',
        categorySlug: 'sugars-salts-sweeteners',
        subcategorySlug: 'refined-brown-sugars',
        brandSlug: 'madhur-pure-sugar',
        price: 75,
        mrp: 99,
        unit: '1 kg',
        description: 'Rich in natural molasses minerals with warm caramel aroma. Perfect for baking & coffee.',
        image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&auto=format&fit=crop&q=80',
        ],
        isBestOffer: true,
        deliveryPrice: 25,
      },
      // 7. Jaggery Powder
      {
        name: 'Traditional Palm Jaggery Powder (Organic Gur)',
        slug: 'traditional-palm-jaggery-powder-organic-gur',
        categorySlug: 'sugars-salts-sweeteners',
        subcategorySlug: 'organic-jaggery-mineral-salts',
        brandSlug: 'tata-salt-sampann',
        price: 89,
        mrp: 120,
        unit: '500 g',
        description: 'Chemical-free crushed country jaggery powder packed with natural iron and calcium.',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
        ],
        isBestOffer: false,
        deliveryPrice: 25,
      },
      // 8. Pink Rock Salt
      {
        name: 'Himalayan Pure Pink Rock Salt Powder',
        slug: 'himalayan-pure-pink-rock-salt-powder',
        categorySlug: 'sugars-salts-sweeteners',
        subcategorySlug: 'organic-jaggery-mineral-salts',
        brandSlug: 'tata-salt-sampann',
        price: 55,
        mrp: 75,
        unit: '1 kg',
        description: 'Pristine ancient Himalayan mineral pink salt containing 84 natural trace minerals.',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
        ],
        isBestOffer: false,
        deliveryPrice: 25,
      },
      // 9. Whole Wheat Atta
      {
        name: '100% Whole Wheat Chakki Fresh Atta',
        slug: '100-whole-wheat-chakki-fresh-atta',
        categorySlug: 'flours-atta-grains',
        subcategorySlug: 'whole-wheat-atta-maida',
        brandSlug: 'aashirvaad-grains',
        price: 220,
        mrp: 275,
        unit: '5 kg',
        description: 'Traditional chakki stone-milled wheat flour ensuring soft, fluffy rotis with rich bran fiber.',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
        ],
        isBestOffer: true,
        deliveryPrice: 30,
      },
      // 10. Roasted Rice Powder
      {
        name: 'Traditional Roasted Rice Powder (Puttu Podi)',
        slug: 'traditional-roasted-rice-powder-puttu-podi',
        categorySlug: 'flours-atta-grains',
        subcategorySlug: 'specialty-powders-besan',
        brandSlug: 'nirapara-traditional-foods',
        price: 58,
        mrp: 78,
        unit: '1 kg',
        description: 'Pre-roasted coarse rice flour for soft layered Kerala puttu and traditional breakfast delicacies.',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
        ],
        isBestOffer: false,
        deliveryPrice: 30,
      },
      // 11. Besan Powder
      {
        name: 'Pure Roasted Bengal Gram Besan Powder',
        slug: 'pure-roasted-bengal-gram-besan-powder',
        categorySlug: 'flours-atta-grains',
        subcategorySlug: 'specialty-powders-besan',
        brandSlug: 'tata-salt-sampann',
        price: 62,
        mrp: 85,
        unit: '500 g',
        description: 'Finely ground 100% chana dal flour for crispy pakoras, sweets, and savory snacks.',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
        ],
        isBestOffer: false,
        deliveryPrice: 30,
      },
      // 12. Tea Dust
      {
        name: 'Strong CTC Assam Dust Tea (Kadak Chai Blend)',
        slug: 'strong-ctc-assam-dust-tea-kadak-chai',
        categorySlug: 'beverages-tea-powders',
        subcategorySlug: 'tea-dust-leaf-blends',
        brandSlug: 'red-label-taj-mahal-tea',
        price: 135,
        mrp: 180,
        unit: '500 g',
        description: 'Extra strong malty CTC tea dust providing deep reddish brew and morning refreshing punch.',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
        ],
        isBestOffer: true,
        deliveryPrice: 20,
      },
      // 13. Filter Coffee
      {
        name: 'South Indian Traditional Filter Coffee (80:20 Chicory)',
        slug: 'south-indian-traditional-filter-coffee',
        categorySlug: 'beverages-tea-powders',
        subcategorySlug: 'filter-coffee-cocoa-powders',
        brandSlug: 'bru-continental-coffee',
        price: 110,
        mrp: 145,
        unit: '200 g',
        description: 'Authentic dark roasted Arabica & Robusta coffee blend blended with 20% premium French chicory.',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
        ],
        isBestOffer: true,
        deliveryPrice: 20,
      },
    ];

    for (const prodData of productsData) {
      const cat = savedCategories[prodData.categorySlug];
      const sub = savedSubcategories[prodData.subcategorySlug];
      const b = savedBrands[prodData.brandSlug];

      let prod = await Product.findOne({ slug: prodData.slug });
      if (!prod) {
        prod = await Product.create({
          name: prodData.name,
          slug: prodData.slug,
          categoryId: cat?._id || null,
          categoryName: cat?.name || '',
          subcategoryId: sub?._id || null,
          subcategoryName: sub?.name || '',
          brandId: b?._id || null,
          brandName: b?.name || '',
          price: prodData.price,
          mrp: prodData.mrp,
          originalPrice: prodData.mrp,
          unit: prodData.unit,
          description: prodData.description,
          image: prodData.image,
          images: prodData.images,
          isBestOffer: prodData.isBestOffer,
          deliveryPrice: prodData.deliveryPrice,
          stockQuantity: 100,
          inStock: true,
          isActive: true,
          status: 'ACTIVE',
          shopId: shop?._id || null,
        });
        console.log(`✅ Product created: ${prod.name}`);
      } else {
        prod.price = prodData.price;
        prod.mrp = prodData.mrp;
        prod.image = prodData.image;
        prod.images = prodData.images;
        prod.isBestOffer = prodData.isBestOffer;
        await prod.save();
        console.log(`ℹ️ Product updated: ${prod.name}`);
      }
    }

    // =========================================================================
    // 5. ADD OFFER BANNERS
    // =========================================================================
    const newOffersData = [
      {
        title: 'Mega Spice Festival — Chilli & Haldi',
        description: 'Sun-dried Kashmiri red chilli & pure aromatic golden turmeric powders',
        actualPrice: 160,
        offerPrice: 99,
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
        tagBadge: '🌶️ Hot Deal -38%',
        isActive: true,
        order: 5,
      },
      {
        title: 'Sulphur-Free Crystal Sugar Super Saver',
        description: 'Sparkling clean crystal white sugar for tea, desserts and daily pantry',
        actualPrice: 120,
        offerPrice: 89,
        image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600&auto=format&fit=crop&q=80',
        tagBadge: '⚡ Sweet Saver Deal',
        isActive: true,
        order: 6,
      },
      {
        title: 'Chakki Fresh Atta & Flours Combo',
        description: '100% whole wheat stone ground flour & traditional fine rice puttu podi',
        actualPrice: 350,
        offerPrice: 269,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
        tagBadge: '🌾 Farm Harvest -23%',
        isActive: true,
        order: 7,
      },
      {
        title: 'Morning Kadak Tea & Filter Coffee Roast',
        description: 'Strong Assam CTC tea dust & South Indian 80:20 plantation roast coffee',
        actualPrice: 290,
        offerPrice: 199,
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
        tagBadge: '☕ Morning Boost -31%',
        isActive: true,
        order: 8,
      },
    ];

    for (const offData of newOffersData) {
      let offer = await Offer.findOne({ title: offData.title });
      if (!offer) {
        offer = await Offer.create(offData);
        console.log(`✅ Offer banner created: ${offer.title}`);
      } else {
        offer.image = offData.image;
        offer.actualPrice = offData.actualPrice;
        offer.offerPrice = offData.offerPrice;
        offer.tagBadge = offData.tagBadge;
        await offer.save();
        console.log(`ℹ️ Offer banner updated: ${offer.title}`);
      }
    }

    console.log('🎉 [Success]: 4 Categories, 8 Subcategories, Brands, Grocery Powders & Offer Banners populated!');
  } catch (err) {
    console.error('❌ Error populating catalog:', err);
  }
};

// If run directly via node
if (process.argv[1]?.endsWith('populateNewCatalog.js')) {
  populateNewCatalog().then(() => {
    process.exit(0);
  });
}

export default populateNewCatalog;
