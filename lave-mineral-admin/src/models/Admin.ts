import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAlternateAddress {
  label: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  image?: string;

  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  alternatePhoneNumbers?: string[];
  alternateAddresses?: IAlternateAddress[];

  createdAt?: Date;
  updatedAt?: Date;
}

const AlternateAddressSchema = new Schema<IAlternateAddress>(
  {
    label: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    pincode: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const AdminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    image: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    pincode: {
      type: String,
      default: "",
      trim: true,
    },

    alternatePhoneNumbers: {
      type: [String],
      default: [],
    },
    alternateAddresses: {
      type: [AlternateAddressSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;