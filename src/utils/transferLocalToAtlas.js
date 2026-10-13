import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_URI = 'mongodb://127.0.0.1:27017/shamil_db';
const ATLAS_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://shamilalsalhya_db_user:5usKgqwf41subeAp@cluster0.stehh9f.mongodb.net/shamil_db?retryWrites=true&w=majority';

async function migrateData() {
  console.log('🔄 Starting data migration from Local MongoDB to MongoDB Atlas...');
  console.log(`📥 Source (Local): ${LOCAL_URI}`);
  console.log(`📤 Destination (Atlas): ${ATLAS_URI.replace(/:[^:]*@/, ':****@')}`);

  let localConn = null;
  let atlasConn = null;

  try {
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to Local MongoDB');

    atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connected to MongoDB Atlas');

    const collections = await localConn.db.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections in Local DB:`, collections.map((c) => c.name));

    let totalTransferred = 0;

    for (const colInfo of collections) {
      const colName = colInfo.name;
      const localCol = localConn.db.collection(colName);
      const atlasCol = atlasConn.db.collection(colName);

      const docs = await localCol.find({}).toArray();
      console.log(`\n📂 Collection [${colName}]: Found ${docs.length} local records`);

      if (docs.length === 0) {
        console.log(`  ↪ Skipping empty collection [${colName}]`);
        continue;
      }

      // Clear existing records in Atlas to ensure identical clone without slug collisions
      await atlasCol.deleteMany({});

      // Insert all local documents
      const insertResult = await atlasCol.insertMany(docs);
      console.log(`  ✅ [${colName}] Migrated ${insertResult.insertedCount} records to Atlas`);
      totalTransferred += insertResult.insertedCount;
    }

    console.log('\n🎉 ==============================================');
    console.log(`🎉 Migration Completed Successfully!`);
    console.log(`🎉 Total documents processed: ${totalTransferred}`);
    console.log('🎉 ==============================================\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
    console.log('🔒 Connections closed.');
  }
}

migrateData();
