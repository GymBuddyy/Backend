import { Logger } from "tslog";
import express from 'express';

export default class CommunityRouter{
    private router;
    private log = new Logger();
    public constructor() {
        this.router = express.Router();
        this.addRoutes();
    }
    private addRoutes() {
        
    }

    public get(){
        return this.router;
    }
}