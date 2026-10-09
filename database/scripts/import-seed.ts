/**
 * Import seed data from data/*.json into MongoDB Atlas.
 * Run: npm run db:seed (from web-platform/)
 */
import { readFileSync } from "fs";
import { join } from "path";
import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";

const DATA_DIR = join(__dirname, "../../data");
const MONGODB_URI = 
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/campusguide";

function loadJson<T>(filename: string): T {
  const raw = readFileSync(join(DATA_DIR, filename), "utf-8");
  return JSON.parse(raw) as T;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("🌱 Campus Guide 3D — Database Seed");
  console.log("=".repeat(50));

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("campusguide");

  const faculty = loadJson<
    Array<{
      id: string;
      name: string;
      department: string;
      departmentSlug?: string;
      designation?: string;
      qualification?: string;
      specialization?: string;
      room: string;
      floor: number;
      position: { x: number; y: number; z: number };
      contact?: string;
      bio?: string;
      status?: string;
    }>
  >("faculty.json");

  const rooms = loadJson<
    Array<{
      roomNumber: string;
      meshName?: string;
      name?: string;
      roomType: string;
      floor: number;
      position: { x: number; y: number; z: number };
      wing?: string;
    }>
  >("rooms.json");

  const departments = loadJson<
    Array<{
      slug: string;
      name: string;
      shortName?: string;
      floor?: number;
      position?: { x: number; y: number; z: number };
      color?: string;
    }>
  >("departments.json");

  const navNodes = loadJson<
    Array<{
      nodeId: string;
      name: string;
      nodeType: string;
      floor: number;
      roomNumber?: string;
      position: { x: number; y: number; z: number };
    }>
  >("navigation-nodes.json");

  const navEdges = loadJson<
    Array<{
      fromNodeId: string;
      toNodeId: string;
      weight: number;
      bidirectional: boolean;
    }>
  >("navigation-edges.json");

  const now = new Date();

  await db.collection("departments").deleteMany({});
  await db.collection("departments").insertMany(
    departments.map((d) => ({
      ...d,
      createdAt: now,
      updatedAt: now,
    }))
  );
  console.log(`✅ Departments: ${departments.length}`);

  await db.collection("rooms").deleteMany({});
  await db.collection("rooms").insertMany(
    rooms.map((r) => ({
      ...r,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }))
  );
  console.log(`✅ Rooms: ${rooms.length}`);

  await db.collection("faculty").deleteMany({});
  await db.collection("faculty").insertMany(
    faculty.map((f) => ({
      slug: slugify(f.name),
      name: f.name,
      department: f.department,
      departmentSlug: f.departmentSlug,
      designation: f.designation ?? "",
      qualification: f.qualification ?? "",
      specialization: f.specialization ?? "",
      roomNumber: f.room,
      floor: f.floor,
      position: f.position,
      contact: f.contact ?? "",
      bio: f.bio ?? "",
      status: f.status ?? "available",
      createdAt: now,
      updatedAt: now,
    }))
  );
  console.log(`✅ Faculty: ${faculty.length}`);

  await db.collection("navigation_nodes").deleteMany({});
  await db.collection("navigation_nodes").insertMany(
    navNodes.map((n) => ({ ...n, createdAt: now }))
  );
  console.log(`✅ Navigation Nodes: ${navNodes.length}`);

  await db.collection("navigation_edges").deleteMany({});
  await db.collection("navigation_edges").insertMany(
    navEdges.map((e) => ({ ...e, createdAt: now }))
  );
  console.log(`✅ Navigation Edges: ${navEdges.length}`);

  const passwordHash = await hash("CampusGuide@2026", 12);
  await db.collection("users").updateOne(
    { email: "admin@campusguide.edu" },
    {
      $set: {
        name: "System Admin",
        passwordHash,
        role: "superadmin",
        status: "active",
        requiresPasswordChange: false,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );
  console.log("✅ Admin user created/updated: admin@campusguide.edu / CampusGuide@2026");

  const initialSuperAdminHash = await hash("Jit@12345", 12);
  await db.collection("users").updateOne(
    { email: "chinmay_al231014@jitechno.com" },
    {
      $set: {
        name: "Chinmay Joshi",
        passwordHash: initialSuperAdminHash,
        role: "superadmin",
        status: "active",
        requiresPasswordChange: true,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );
  console.log("✅ Initial Super Admin seeded: chinmay_al231014@jitechno.com / Jit@12345 (Requires Change)");

  await client.close();
  console.log("\n🎉 Seed complete!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
