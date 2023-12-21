export default interface UserAuth {
    uid: object,
    stsTokenManager : {
        accessToken: string,
        refreshToken: string,
    }
}