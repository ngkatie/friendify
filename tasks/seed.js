import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import * as users from "../data/users.js";
//import { comments } from "../data/comments.js";

const db = await dbConnection();
//await db.dropDatabase();

// await users.create('johndoe', 'johndoe@example.com', 'password123')
// await users.create('janedoe', 'janedoe@example.com', 'password123')
// await users.create('bobsmith', 'bobsmith@example.com', 'password123')
// await users.create('alicejones', 'alicejones@example.com', 'password123')
// await users.create('tomwilson', 'tomwilson@example.com', 'password123')

let id_user = await users.getByEmail('ksato@stevens.edu');
let id_1 = await users.getByEmail('johndoe@example.com');
let id_2 = await users.getByEmail('janedoe@example.com');
let id_3 = await users.getByEmail('bobsmith@example.com');
let id_4 = await users.getByEmail('alicejones@example.com');


//await users.sendFriendRequest(id_user, id_1);
await users.sendFriendRequest(id_user, id_2);
await users.sendFriendRequest(id_user, id_3);
await users.sendFriendRequest(id_user, id_4);

await users.acceptFriend(id_1, id_user);
await users.acceptFriend(id_2, id_user);



console.log('DONE W SEEDING')
await closeConnection();