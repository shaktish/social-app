export interface RegisterUserInput {
  email: string;
  password: string;
  userName: string;
}

export type LoginUserInput = Omit<RegisterUserInput, "userName">;

export interface RefreshTokenI {
  refreshToken : string
}
