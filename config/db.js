const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zcznn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Retry logic
async function connectDB(retries = 5, delay = 3000) {
  while (retries > 0) {
    try {
      await client.connect();
      console.log("Connected to MongoDB");
      return;
    } catch (error) {
      console.error(`Failed to connect to MongoDB: ${error.message}`);
      retries -= 1;
      if (retries === 0) {
        console.error("No more retries left. Exiting...");
        process.exit(1);
      } else {
        console.log(
          `Retrying connection in ${
            delay / 1000
          } seconds... (${retries} retries left)`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}

module.exports = { client, connectDB };
