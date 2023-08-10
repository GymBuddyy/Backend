import { Logger } from "tslog";
import express, { Request, Response } from 'express';
import { collections } from "../services/database.service";
import { ObjectId } from "mongodb";
import Community from "../models/Community";
import { CreateCommunityRequest } from "../types";

export default class CommunityRouter{
    private router;
    private log = new Logger();
    public constructor() {
        this.router = express.Router();
        this.addRoutes();
    }
    private addRoutes() {
        this.router.post("/join-community/:id/:username", async (req: Request, res: Response) => {
            const communityId = req.params.id;
            const username = req.params.username;
            try {
                const user = await collections.users.findOne({username, community: communityId});
                if (!user) {
                    const community = (await collections.community.findOne({_id: new ObjectId(communityId)}));
                    if (community) {
                        await collections.community.updateOne({_id: new ObjectId(communityId)}, {
                            $set: {
                                members: [...community.members, username],
                                membersSize: community.membersSize + 1,
                                followers: [...community.followers, username],
                                followersSize: community.followersSize + 1,
                            }
                        });
                    } else {
                        res.status(400).send({message: "COMMUNITY_NOT_FOUND"});
                    }
                } else {
                    res.status(400).send({message: "ALREADY_JOINED"});
                }
            } catch (err) {
                this.log.error(err);
            }
        })
        this.router.post("/leave-community/:id/:username", async (req: Request, res: Response) => {
            const communityId = req.params.id;
            const username = req.params.username;
            try {
                const user = await collections.users.findOne({username, community: communityId});
                if (user) {
                    const community = (await collections.community.findOne({_id: new ObjectId(communityId)}));
                    if (community) {
                        const memberIndex = community.members.indexOf(username, 0);
                        const followersIndex = community.followers.indexOf(username, 0);
                        await collections.community.updateOne({_id: new ObjectId(communityId)}, {
                            $set: {
                                members: [...community.members.splice(memberIndex, 1)],
                                membersSize: community.membersSize - 1,
                                followers: [...community.followers.splice(followersIndex, 1)],
                                followersSize: community.followersSize - 1,
                            }
                        });
                    } else {
                        res.status(400).send({message: "COMMUNITY_NOT_FOUND"});
                    }
                } else {
                    res.status(400).send({message: "ALREADY_LEFT"});
                }
            } catch (err) {
                this.log.error(err);
            }
        })
        this.router.post("/follow-community/:id/:username", (req: Request, res: Response) => {
            // @ts-ignore
        })
        this.router.post("/unfollow-community/:id/:username", (req: Request, res: Response) => {
            // @ts-ignore
        })
        this.router.post("/create-community", async (req: Request, res: Response) => {
            const body = req.body as CreateCommunityRequest
            const newCommunity: Partial<Community> = {
                ...body,
                admin: [body.owner],
                members: [body.owner],
                followers: [body.owner],
                membersSize: 1,
                followersSize: 1,
                invitationsCode: crypto.randomUUID(),
                mods: [body.owner],
                dateCreated: new Date(),
            }
            const result = await collections.community.insertOne(newCommunity);
            if (result) {
                this.log.info("Successfully created new community")
                return res.sendStatus(200);
            } else {
                this.log.info("Failed to create new community")
                return res.send(500).send({message: "FAILED_OPERATION"})
            }
        })
    }
    public get(){
        return this.router;
    }
}