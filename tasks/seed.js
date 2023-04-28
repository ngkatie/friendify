import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import { users } from "./data/users.js";
import { comments } from "./data/comments.js";

const db = await dbConnection();
await db.dropDatabase();

await users.create()
await users.create()
await users.create()
await users.create()
await users.create()



console.log('DONE W SEEDING')
await closeConnection();