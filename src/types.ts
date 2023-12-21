export type SignupRequest = {

}

export type SigninRequest = {
    username: string,
    password: string,
    deviceId?: string
}

export type CreateCommunityRequest = {
    name: string,
    country: string,
    city: string,
    owner: string
    address?: string,
    description?: string
}