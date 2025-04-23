import mongoose, { Schema } from "mongoose";

const ApplicationSchema = new Schema(
    {   
      applicant: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
      },
      processedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
        businessName: {
            type: String,
        },
        businessType: {
            type: String,
            required: true,
        },
        businessStage: {
             type: String,
              required: true
        },
        numEmployees: {
            type: Number,
        },
        monthlyIncome: {
            type: Number,
            required: true,
        },
        fundingPurpose: {
            type: String,
            required: true,
        },
        requiredAmount: {
            type: Number,
            required: true,
        },
        fundingType: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Application = mongoose.model("Application", ApplicationSchema);
