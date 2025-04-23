import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        community: {
            type: Schema.Types.ObjectId,
            ref: "Community",
            required: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Message = mongoose.model("Message", messageSchema);