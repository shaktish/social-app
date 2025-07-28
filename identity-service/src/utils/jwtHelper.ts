import jwt from 'jsonwebtoken';
import { IUser } from '../models/userModel';
import config from '../config/config';
import crypto from 'crypto';
import refreshTokenModel from '../models/refreshTokenModel';

interface JwtPayload {
  id: string;
  email: string;
  userName: string;
}

const generateTokens = async (user:IUser) => {
    const payload : JwtPayload = {
        id:user._id.toString(),
        email:user.email,
        userName:user.userName,
    }
    const accessToken = jwt.sign(payload, config.JWT_SECRET, {expiresIn : "24h"});
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(); 
    expiresAt.setDate(expiresAt.getDate() + 7); // refresh token expires in 7 days

    await refreshTokenModel.create({
        token : refreshToken,
        user: user._id,
        expiresAt,
      });

    return {accessToken, refreshToken};
}

export {
    generateTokens
}