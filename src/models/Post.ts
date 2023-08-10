import { ObjectId } from "mongodb";

export default class Post{
    constructor(
        author: string,
        id: ObjectId,
        title: string,
        description: string,
        images: string[],
        likes: number,
        comments: {
            author: string,
            comment: string
        }[],
        views: number,
        datePosted: any,
        communityId: string,
        relatedContent?: string[]
    ) {
        // @ts-ignore
    }
}