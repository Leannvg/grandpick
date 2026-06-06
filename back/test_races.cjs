const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb+srv://leandrovedia_db_user:pMIgNyOW5MNhhRoY@grandpick-cluster.thbqfgk.mongodb.net/');
  try {
    await client.connect();
    const db = client.db('GrandPick');
    
    // Check first 3 races that are not finalized
    const races = await db.collection('Races').aggregate([
      { $match: { state: { $ne: 'Finalizado' } } },
      { $sort: { date_race: 1 } },
      { $limit: 3 }
    ]).toArray();
    
    console.log(JSON.stringify(races, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
