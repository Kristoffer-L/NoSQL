require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const app = express();

const uri = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

const client = new MongoClient(uri);

let collection;

async function main() {
  try {
    await client.connect();
    const db = client.db("todo");
    collection = db.collection("collection");
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

main();

app.use(express.json());

app.get("/todo", async (req, res) => {
  try {
    const todos = await collection.find().toArray();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/todo", async (req, res) => {
  try {
    const result = await collection.insertOne(req.body);
    res.json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to create todo" });
  }
});

app.put("/todo/:id", async (req, res) => {
  const id = req.params.id.trim();

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: "Failed to update todo" });
  }
});

app.delete("/todo/:id", async (req, res) => {
  try {
    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
