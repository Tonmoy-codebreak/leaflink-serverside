const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
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

app.get('/allusers', async (req, res) => {
  try {
    const collection = client.db("garden_theme").collection("active_users");
    const results = await collection.find({}).toArray();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching all users');
  }
});

// tips_db and tips_collection

app.get('/alltips', async (req, res) => {
  try {
    const collection = client.db("tips_db").collection("tips_collection");
    const results = await collection.find().toArray();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching all users');
  }
});



app.get('/publictips', async (req, res) => {
  try {
    const collection = client.db("tips_db").collection("tips_collection");
    const results = await collection.find({availability:"Public"}).toArray();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching all users');
  }
});


app.get('/toptips', async (req, res) => {
  try {
    const collection = client.db("tips_db").collection("tips_collection");
    const results = await collection.find({availability:"Public"}).limit(6).toArray();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching all users');
  }
});


app.get('/tips/:id', async (req, res) => {
  try {
    const collection = client.db("tips_db").collection("tips_collection");
    const tipId = req.params.id;

    const result = await collection.findOne({ _id: new ObjectId(tipId) });

    if (!result) {
      return res.status(404).json({ error: "Tip not found" });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching tip by ID");
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