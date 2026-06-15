import { connectToDatabase } from "../../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, value } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection(process.env.USERS_COLLECTION || "admin_users");
    const activationsCollection = db.collection(process.env.ACTIVATIONS_COLLECTION || "admin_activations");

    const result = await usersCollection.findOneAndUpdate(
      { email },
      { $set: { unlimited: !!value, unlimitedAt: value ? Date.now() : null } },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    if (value) {
      await activationsCollection.insertOne({
        email,
        activatedAt: Date.now(),
      });
    }

    return res.status(200).json({ user: result });
  } catch (error) {
    console.error("Admin toggle unlimited error:", error);
    return res.status(500).json({ error: "Failed to toggle unlimited" });
  }
}
