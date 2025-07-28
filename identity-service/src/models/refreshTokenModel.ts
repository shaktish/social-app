import mongoose, { Schema } from "mongoose";

interface RefreshTokenSchemaI {
    token : string,
    user : mongoose.Types.ObjectId,
    expiresAt : Date, 
}

const refreshTokenSchema = new Schema<RefreshTokenSchemaI>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

refreshTokenSchema.index({expiresAt : 1}, {expireAfterSeconds : 0});

export default mongoose.model('RefreshToken', refreshTokenSchema);