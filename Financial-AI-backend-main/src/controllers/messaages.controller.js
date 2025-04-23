import {Message} from "../models/messages.models.js";

// Send a message in a community
export const sendMessage = async (req, res,next) => {
    try {
        const { content } = req.body;
        const communityId = req.params.id;
        const senderId = req.user._id;

        const message = await Message.create({
            community: communityId,
            sender: senderId,
            content,
        });

        const populatedMessage = await Message.findById(message._id).populate(
            "sender",
            "username"
        );

        // Broadcast the message to all users in the community room
        // req.io.to(communityId).emit("receiveMessage", populatedMessage);

        return res.status(201).json({
            statusCode: 200,
            data: message,
            message: "Message Sent Successfully"
        });

    } catch (error) {
        next(error);
    }
};

// Get messages for a community
export const getMessages = async (req, res,next) => {
    try {
        const communityId = req.params.id;
        const messages = await Message.find({ community: communityId })
            .populate("sender", "username")
            .sort({ createdAt: 1 });

        return res.status(201).json({
            statusCode: 200,
            data: messages,
            message: "Messages fetched Successfully"
        });

    } catch (error) {
        next(error);
    }
};