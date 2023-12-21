import bodyParser from 'body-parser';
import express, { NextFunction, Request, Response } from 'express';
import { Logger, ILogObj } from "tslog";
import UserRouter from './routers/userRouter';
import { connectToDatabase, collections } from './services/database.service';
import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import admin from 'firebase-admin';
import cors from 'cors';
export default class ApplicationServices {
    private app;
    private log: Logger<ILogObj> = new Logger();
    public constructor () {
        dotenv.config();
        this.app = express();
        this.app.use(bodyParser.json());
        this.addRoutes();
        connectToDatabase();
    }
    public launch() {
        const PORT = 9000;
        this.app.listen(9000, () => {
            this.log.info("Successfully launched at port", PORT)
        })
        this.log.info("Initializing Firebase");
        initializeApp({
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASUREMENT_ID
        });
        getAuth();
    }

    private addAuthentication = () => {
        this.app.use(
            // middleware to authenticate requests
            async (req: Request, res: Response, next: NextFunction) => {
                const auth = req.headers.authorization;
                if (auth) {
                    const token = auth.split(" ")[1];
                    if (token) {
                        // check if token is valid
                        const decodedToken = await admin.auth().verifyIdToken(token);
                        if (decodedToken) {
                            next();
                        } else {
                            res.status(401).send("Unauthorized");
                        }
                    } else {
                        res.status(401).send("Unauthorized");
                    }
                } else {
                    res.status(401).send("Unauthorized");
                }
            }
        );
    }

    private addRoutes() {
        this.app.use(cors());
        this.app.get("/test", (req: Request, res: Response) => {
            res.send("Hello from GymBuddy backend \n")
        })
        this.app.use("/user", new UserRouter().get())
        this.addAuthentication();
    }
}