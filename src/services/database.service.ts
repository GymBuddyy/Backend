import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
import { Logger } from "tslog";

export const collections: {
    users?: mongoDB.Collection,
    userAuth?: mongoDB.Collection
} = {}

export async function connectToDatabase () {
    const log = new Logger()
    dotenv.config();

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING);
    await client.connect();
    const db: mongoDB.Db = client.db("gymbuddy");
    const usersCollection: mongoDB.Collection = db.collection("Users");
    const userAuthCollection: mongoDB.Collection = db.collection("UserAuth");
    collections.users = usersCollection;
    collections.userAuth = userAuthCollection;
    // @ts-ignore
    log.info(`Successfully connected to database: ${db.databaseName} and collection: ${[
        usersCollection.collectionName,
        userAuthCollection.collectionName
    ]}`);
 }