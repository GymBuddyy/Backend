import { ObjectId } from "mongodb";

export default class Community{
    constructor(
        public name: string,
        public members: string[],
        public membersSize: number,
        public followers: string[],
        public followersSize: number,
        public invitationsCode: string,
        public country: string,
        public city: string,
        public mods: string[],
        public dateCreated: any,
        public admin: string[],
        public owner: string,
        public id: ObjectId,
        public description?: string,
        public address?: string,
    ){
        // @ts-ignore
    }
}