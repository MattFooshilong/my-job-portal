import { Pool, Client } from "pg";
const connectionString = process.env.DATABASE_URL;
const client = new Client({
  connectionString
});
await client.connect().then(() => console.log("postgres db connected"));
export default client;
