require("dotenv").config();
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

app.get("/activeusers", async (req, res) => {
  try {
    const collection = client.db("garden_theme").collection("active_users");
    const results = await collection
      .find({ status: "active" })
      .limit(6)
      .toArray();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching active users");
  }
});

app.get("/allusers", async (req, res) => {
  try {
    const collection = client.db("garden_theme").collection("active_users");
    const results = await collection.find({}).toArray();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching all users");
  }
});

// tips_db and tips_collection

app.get("/alltips", async (req, res) => {
  try {
    const collection = client.db("tips_db").collection("tips_collection");
    const results = await collection.find().toArray();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching all users");
  }
});

app.get("/publictips", async (req, res) => {
  try {
    const collection = client.db("tips_db").collection("tips_collection");
    const results = await collection.find({ availability: "Public" }).toArray();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching all users");
  }
});

app.get("/toptips", async (req, res) => {
  try {
    const collection = client.db("tips_db").collection("tips_collection");
    const results = await collection
      .find({ availability: "Public" })
      .limit(8)
      .toArray();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching all users");
  }
});

app.get("/tips/:id", async (req, res) => {
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

app.post("/alltips", async (req, res) => {
  try {
    const collection = client.db("tips_db").collection("tips_collection");
    const tipData = req.body;

    const result = await collection.insertOne(tipData);
    res
      .status(201)
      .json({
        message: "Tip submitted successfully",
        insertedId: result.insertedId,
      });
  } catch (error) {
    console.error("Error submitting tip:", error);
    res.status(500).send("Failed to submit tip");
  }
});

app.get("/ownedtips", async (req, res) => {
  try {
    const userEmail = req.query.email;

    if (!userEmail) {
      return res
        .status(400)
        .json({ error: "Email query parameter is required" });
    }

    const collection = client.db("tips_db").collection("tips_collection");
    const results = await collection.find({ email: userEmail }).toArray();

    res.json(results);
  } catch (error) {
    console.error("Error fetching user tips:", error);
    res.status(500).send("Failed to fetch user tips");
  }
});

// show all tips
app.delete("/alltips/:id", async (req, res) => {
  try {
    const collection = client.db("tips_db").collection("tips_collection");
    const tipId = req.params.id;

    const result = await collection.deleteOne({ _id: new ObjectId(tipId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Tip not found" });
    }

    res.json({ message: "Tip deleted successfully" });
  } catch (error) {
    console.error("Error deleting tip:", error);
    res.status(500).send("Failed to delete tip");
  }
});

// Update tips Section
app.put("/alltips/:id", async (req, res) => {
  try {
    const tipId = req.params.id;
    const updatedTip = req.body;

    const collection = client.db("tips_db").collection("tips_collection");

    const result = await collection.updateOne(
      { _id: new ObjectId(tipId) },
      { $set: updatedTip }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Tip not found" });
    }

    res.json({ message: "Tip updated successfully" });
  } catch (error) {
    console.error("Error updating tip:", error);
    res.status(500).send("Failed to update tip");
  }
});

// collecting all user data from tips_collection
app.get("/tip-users", async (req, res) => {
  try {
    const collection = client.db("tips_db").collection("tips_collection");

    const tips = await collection.find().toArray();

    const userMap = new Map();

    for (const tip of tips) {
      if (tip.email && !userMap.has(tip.email)) {
        userMap.set(tip.email, {
          name: tip.name,
          email: tip.email,
          image: tip.image || "/default-avatar.png",
          age: tip.age || "N/A",
          gender: tip.gender || "N/A",
          experience: tip.experience || "N/A",
          totalSharedTips: 1,
        });
      } else if (tip.email) {
        userMap.get(tip.email).totalSharedTips += 1;
      }
    }

    res.json(Array.from(userMap.values()));
  } catch (error) {
    console.error("Error generating tip-users:", error);
    res.status(500).send("Failed to get tip users");
  }
});

async function startServer() {
  try {
    // await client.connect();
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`LeafLink listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

startServer();
