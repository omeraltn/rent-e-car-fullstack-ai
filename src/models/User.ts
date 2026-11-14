import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  _id?: string | mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "user" | "admin";
  provider: "credentials" | "google";
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Lütfen bir isim belirtin"],
      trim: true,
      maxlength: [100, "İsim 100 karakteri geçemez"],
    },
    email: {
      type: String,
      required: [true, "Lütfen bir e-posta adresi belirtin"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Lütfen geçerli bir e-posta adresi girin",
      ],
    },
    password: {
      type: String,
      select: false,
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
