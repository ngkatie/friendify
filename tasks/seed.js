import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import * as users from "../data/users.js";
//import { comments } from "../data/comments.js";

const db = await dbConnection();
await db.dropDatabase();

await users.create('johndoe', 'johndoe@example.com', 'password123')
await users.create('janedoe', 'janedoe@example.com', 'password456')
await users.create('bobsmith', 'bobsmith@example.com', 'password789')
await users.create('alicejones', 'alicejones@example.com', 'password321')
await users.create('tomwilson', 'tomwilson@example.com', 'password654')



console.log('DONE W SEEDING')
await closeConnection();