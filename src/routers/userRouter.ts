import express, { Request, Response } from 'express';
import { collections } from '../services/database.service';
import { Logger } from 'tslog';
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';
import UserAuth from '../types/UserAuth';

export default class UserRouter {
    private router;
    private log = new Logger();
    public constructor() {
        this.router = express.Router();
        this.addRoutes();
    }

    public addRoutes () {
        this.router.post("/register", async (req:Request, res:Response) => {
            const {email, username, password} = req.body;
            const auth = getAuth();
            try {
                const userCred = await createUserWithEmailAndPassword(auth, email, password)
                // @ts-ignore
                const user:UserAuth = userCred.user;
                this.log.info("Registering user");
                this.log.info("User", user.uid);
                try {
                    await collections.users.insertOne({
                        "email": email,
                        "username": username,
                        "id": user.uid,
                    });
                    this.log.info("Successfully registered user");
                } catch (error) {
                    this.log.error("Failed to register user", error);
                }
                res.send({
                    userID: user.uid,
                    userAccessToken: user.stsTokenManager.accessToken,
                    userRefreshToken: user.stsTokenManager.refreshToken,
                });
            } catch (error) {
                const errorCode = error.code;
                const errorMessage = error.message;
                this.log.error(errorMessage, errorCode);
                res.send(errorMessage);
            }
        })
        this.router.post("/login", async (req:Request, res:Response) => {
            // enable cors
            res.set('Access-Control-Allow-Origin', '*');
            const {email, password} = req.body;
            try {
                const userCred = await signInWithEmailAndPassword(getAuth(), email, password);
                this.log.info("Logging in user");
                // @ts-ignore
                const user:UserAuth = userCred.user;
                res.send({
                    userID: user.uid,
                    userAccessToken: user.stsTokenManager.accessToken,
                    userRefreshToken: user.stsTokenManager.refreshToken,
                });
            } catch (error) {
                const errorCode = error.code;
                const errorMessage = error.message;
                this.log.error(errorMessage, errorCode);
                res.send(errorMessage);
            }
        });
    }
    public get(){
        return this.router;
    }
}