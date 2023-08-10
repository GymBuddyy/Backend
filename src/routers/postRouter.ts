import { Logger } from "tslog";
import express, { Request, Response } from 'express';

export default class PostRouter{
    private router;
    private log = new Logger();
    public constructor() {
        this.router = express.Router();
        this.addRoutes();
    }
    private addRoutes() {
        // @ts-ignore
    }
    public get(){
        return this.router;
    }
}