import { ObjectId } from "mongodb";

export default class User {
    constructor(
        username : string,
        password: string,
        firstName: string,
        lastName: string,
        email: string,
        id: ObjectId
    ) {
        // @ts-ignore
    }
}