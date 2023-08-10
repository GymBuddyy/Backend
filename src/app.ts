import bodyParser from 'body-parser';
import express, { NextFunction, Request, Response } from 'express';
import { Logger, ILogObj } from "tslog";
import UserRouter from './routers/userRouter';
import { connectToDatabase, collections } from './services/database.service';
import CommunityRouter from './routers/communityRouter';
export default class ApplicationServices {
    private app;
    private log: Logger<ILogObj> = new Logger();

    public constructor () {
        this.app = express();
        this.app.use(bodyParser.json());
        this.addRoutes();
        connectToDatabase();
    }
    public launch() {
        this.app.listen(9000, () => {
            this.log.info("Successfully launched")
        })
    }

    private addAuthentication = () => {
        this.app.use(async (req: Request, res: Response, next: NextFunction) => {
            const authUser = await collections.userAuth.findOne({authToken : req.headers.authorization});
            if (authUser && authUser.deviceId === req.headers["device-id"]) {
                this.log.info("Authorized request by:", authUser.username);
                return next();
            }
            return res.sendStatus(401);
        })
    }

    private addRoutes() {
        this.app.use("/user", new UserRouter().get())
        this.addAuthentication();
        this.app.use("/community", new CommunityRouter().get());
        this.app.get("/", (req: Request, res: Response) => {
            res.send("Hello from GymBuddy backend")
        })
    }
}