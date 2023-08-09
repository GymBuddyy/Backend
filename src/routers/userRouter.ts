import express, { Request, Response } from 'express';
import { SigninRequest, SignupRequest } from '../types';
import { collections } from '../services/database.service';
import { Logger } from 'tslog';
import bycrypt from "bcrypt";

export default class UserRouter {
    private router;
    private log = new Logger();
    public constructor() {
        this.router = express.Router();
        this.addRoutes();
    }

    public addRoutes () {
        this.router.post("/signup", async (req: Request, res: Response) => {
            this.log.info("Request for signup")
            const body: SignupRequest = req.body;
            try {
                if (!body) return res.status(400).send({message: "NO_BODY_PROVIDED"});
                if (!body.username) return res.status(400).send({message: "NO_USERNAME_PROVIDED"});
                const user = await collections.users.findOne({username: body.username})
                if (user) return res.status(400).send({message: "USERNAME_EXISTS"})
                if (!body.email) return res.status(400).send({message: "NO_EMAIL_PROVIDED"});
                const userEmail = await collections.users.findOne({email: body.email})
                if (userEmail) return res.status(400).send({message: "EMAIL_EXISTS"})
                if (!body.password) return res.status(400).send({message: "NO_PASSWORD_PROVIDED"});
                if (!body.firstName) return res.status(400).send({message: "NO_FIRSTNAME_PROVIDED"});
                if (!body.lastName) return res.status(400).send({message: "NO_LASTNAME_PROVIDED"});
                if (!body.deviceId) return res.status(400).send({message: "NO_DEVICE_ID_PROVIDED"});
                body.password = await this.hashPassword(body.password);
                const result = await collections.users.insertOne(body);
                const authToken = crypto.randomUUID();
                const resultAuth = await collections.userAuth.insertOne({
                    deviceId: body.deviceId,
                    authToken,
                    username: body.username
                });
                if (result && resultAuth) {
                    return res.status(201).send({
                        message: `Successfully created a new user with id ${result.insertedId}`,
                        authToken
                    })
                } else {
                    return res.status(500).send("Failed to create a new user.");
                }
            } catch (err) {
                this.log.error(err);
            }
        })

        this.router.post("/signin", async (req: Request, res: Response) => {
            const body: SigninRequest = req.body;
            this.log.info("Request for signin");
            try {
                if (!body) return res.status(400).send({message: "NO_BODY_PROVIDED"});
                if (!body.password) return res.status(400).send({message: "NO_PASSWORD_PROVIDED"});
                if (!body.username) return res.status(400).send({message: "NO_USERNAME_PROVIDED"});
                const user = await collections.users.findOne({username: body.username});
                if (!user) return res.status(401).send({message: "INVALID_USERNAME_PASSWORD"});
                const isPasswordValid = await this.comparePassword(body.password, user.password);
                if (isPasswordValid) {
                    if (!body.deviceId) return res.status(400).send({message: "NO_DEVICE_ID_PROVIDED"});
                    const authToken = crypto.randomUUID();
                    const updatedAuth =  await
                        collections.userAuth.updateOne({"username": body.username}, {$set: {authToken, deviceId: body.deviceId}});
                    return res.send({authToken});
                } else {
                    return res.status(401).send({message: "INVALID_USERNAME_PASSWORD"});
                }
            } catch (err) {
                this.log.error(err);
            }
        })
    }

    private async hashPassword(plaintextPassword: string) {
        const hash = await bycrypt.hash(plaintextPassword, 10);
        return hash;
    }

    private async comparePassword(plaintextPassword: string, hash: string) {
        const result = await bycrypt.compare(plaintextPassword, hash);
        return result;
    }

    public get(){
        return this.router;
    }
}