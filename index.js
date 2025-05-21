const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// middlewire
app.use(cors());
app.use(express.json());

// -----------------------------------------------------------------------------

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xjy33ni.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// routes
app.get("/", (req, res) => {
  res.send("Hello LeafLink Server!");
});

app.get('/activeusers', async (req, res) => {
  try {
    const collection = client.db("garden_theme").collection("active_users");
    const results = await collection.find({status:"active"}).limit(6).toArray();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching active users');
  }
});



async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`LeafLink listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

startServer();