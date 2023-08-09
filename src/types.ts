export type SignupRequest = {
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
    middleName?: string,
    deviceId: string
}

export type SigninRequest = {
    username: string,
    password: string,
    deviceId?: string
}