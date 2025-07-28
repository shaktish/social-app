import mongoose, { HydratedDocument,  Schema, Model} from "mongoose";
import argon2 from "argon2";

export interface IUser {
  userName: string;
  email: string;
  password: string;
  _id:string;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;


const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    userName: {
      type: String,
      required: [true, "User name is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (this:HydratedDocument<IUser>, next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (err) {
    next(err as Error);
  }
});


userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (e) {
    throw e;
  }
};

userSchema.index({ userName: "text" });

export default mongoose.model<IUser,UserModel>("User", userSchema);
