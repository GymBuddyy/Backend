export interface User {
    firstName: string,
    lastName: string,
    email: string,
    uid: string,
    buddies: string[],
    following: string[],
    followers: string[],
    communityFollowing?: string[],
    community?: string
}