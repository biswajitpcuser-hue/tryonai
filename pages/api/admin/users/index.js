import { connectToDatabase } from "../../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection(process.env.USERS_COLLECTION || "admin_users");
      const users = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json({ users });
    } catch (error) {
      console.error("Admin users fetch error:", error.message, error.stack);
      return res.status(500).json({ error: "Failed to fetch users", detail: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { email, displayName, photoURL } = req.body || {};
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const { db } = await connectToDatabase();
      const collection = db.collection(process.env.USERS_COLLECTION || "admin_users");

      const existing = await collection.findOne({ email });
      if (existing) {
        return res.status(200).json({ user: existing });
      }

      const user = {
        email,
        displayName: displayName || email.split("@")[0],
        photoURL: photoURL || "",
        unlimited: false,
        unlimitedAt: null,
        createdAt: Date.now(),
      };

      await collection.insertOne(user);
      return res.status(201).json({ user });
    } catch (error) {
      console.error("Admin users add error:", error.message, error.stack);
      return res.status(500).json({ error: "Failed to add user", detail: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}
