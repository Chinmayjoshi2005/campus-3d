/**
 * Create MongoDB indexes for Campus Guide 3D.
 * Run: npm run db:indexes (from web-platform/)
 */
import { MongoClient } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/campusguide";

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("campusguide");

  await db.collection("faculty").createIndexes([
    { key: { slug: 1 }, unique: true },
    { key: { name: "text", department: "text", specialization: "text" } },
    { key: { roomNumber: 1 } },
    { key: { department: 1 } },
  ]);

  await db.collection("rooms").createIndexes([
    { key: { roomNumber: 1 }, unique: true },
    { key: { meshName: 1 }, unique: true, sparse: true },
    { key: { name: "text", roomNumber: "text" } },
    { key: { floor: 1, roomType: 1 } },
  ]);

  await db.collection("departments").createIndexes([
    { key: { slug: 1 }, unique: true },
    { key: { name: "text" } },
  ]);

  await db.collection("navigation_nodes").createIndexes([
    { key: { nodeId: 1 }, unique: true },
    { key: { roomNumber: 1 }, sparse: true },
    { key: { floor: 1 } },
  ]);

  await db.collection("navigation_edges").createIndexes([
    { key: { fromNodeId: 1, toNodeId: 1 }, unique: true },
  ]);

  await db.collection("users").createIndexes([
    { key: { email: 1 }, unique: true },
  ]);

  await db.collection("notices").createIndexes([
    { key: { isPublished: 1, publishedAt: -1 } },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0, sparse: true },
  ]);

  await db.collection("audit_logs").createIndexes([
    { key: { userId: 1, timestamp: -1 } },
    { key: { timestamp: 1 } },
  ]);

  console.log("✅ All indexes created.");
  await client.close();
}

main().catch(console.error);
