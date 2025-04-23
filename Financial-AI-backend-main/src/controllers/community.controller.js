import { Community } from "../models/community.models.js";
import { User } from "../models/user.models.js";

// Create a community
export const createCommunity = async (req, res,next) => {
    try {
        const { name, description } = req.body;
        
        const createdBy = req.user._id;

        const community = await Community.create({
            name,
            description,
            createdBy,
            members: [createdBy],
        });

        // Add the community to the user's communities list
        await User.findByIdAndUpdate(createdBy, {
            $push: { communities: community._id },
        });


        return res.status(201).json({
            statusCode: 200,
            data: community,
            message: "Community created Successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Join a community
export const joinCommunity = async (req, res,next) => {
    try {
        const communityId = req.params.id;
        const userId = req.user._id;

        // Add user to the community's members list
        const community = await Community.findByIdAndUpdate(
            communityId,
            { $push: { members: userId } },
            { new: true }
        );

        // Add community to the user's communities list
        await User.findByIdAndUpdate(userId, {
            $push: { communities: communityId },
        });

        return res.status(201).json({
            statusCode: 200,
            data: community,
            message: "User joined community Successfully"
        });

    } catch (error) {
        next(error);
    }
};

// Get all communities
export const getCommunities = async (req, res,next) => {
    try {
        const communities = await Community
        .find()
        .populate(
            "createdBy",
            "username"
        )
        .populate(
            "members",
            "username"
        );
        
        return res.status(201).json({
            statusCode: 200,
            data: communities,
            message: "Communities fetched Successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
        next(error);
    }
};

// Get details of a specific community
// of no use but just kept if required in future
export const getCommunityDetails = async (req, res,next) => {
    try {
        const communityId = req.params.id;
        const community = await Community.findById(communityId)
            .populate("createdBy", "username")
            .populate("members", "username");
        return res.status(201).json({
            statusCode: 200,
            data: community,
            message: "Community fetched Successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
        next(error);
    }
};

export const addUserToCommunity = async (req, res, next) => {
    try {
        const communityId = req.params.id;
        const { username } = req.body;

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Add the user to the community's members list
        const community = await Community.findByIdAndUpdate(
            communityId,
            { $addToSet: { members: user._id } }, // Prevent duplicate entries
            { new: true }
        ).populate("members", "username");

        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }

        // Add the community to the user's communities list
        await User.findByIdAndUpdate(user._id, {
            $addToSet: { communities: communityId },
        });

        return res.status(200).json({
            statusCode: 200,
            data: community,
            message: "User added to community successfully",
        });
    } catch (error) {
        next(error);
    }
};