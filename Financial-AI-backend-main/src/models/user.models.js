import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        fullname: {
            type: String,
            required: false,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 4,
            index: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
        },
        usertype: {
            type: String,
            enum: ["user", "entrepreneur"],
            default: "user",
        },
        communities: [
            {
                type: Schema.Types.ObjectId,
                ref: "Community",
            },
        ],
        refreshToken: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        phoneNumber: {
            type: String,
            required: false,
            trim: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            usertype: this.usertype
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
           expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};


export const User = mongoose.model("User", userSchema);
