// applications.controllers.js
import {Application} from "../models/application.models.js";

// User: Submit application
export const submitApplication = async (req, res,next) => {
    try {
        const application = await Application.create({
            ...req.body,
            applicant: req.user._id
        });
        return res.status(201).json({
            statusCode: 200,
            data: application,
            message: "Application Submitted Successfully"
        });
    } catch (error) {
       next(error);
    }
};

// User: Get applications
export const getUserApplications = async (req, res,next) => {
    try {
        const applications = await Application.find({ applicant: req.user._id })
            .populate('processedBy', 'username');
        return res.status(201).json({
            statusCode: 200,
            data: applications,
            message: "Application fetched Successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Entrepreneur: Get all applications
export const getAllApplications = async (req, res,next) => {
    try {
        const applications = await Application.find()
            .populate('applicant', 'username')
            .populate('processedBy', 'username');
        return res.status(201).json({
            statusCode: 200,
            data: applications,
            message: "Application fetched Successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Entrepreneur: Update application status
export const updateApplicationStatus = async (req, res, next) => {
    try {
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status,
                processedBy: req.user._id
            },
            { new: true }
        ).populate('processedBy', 'username');
        
        return res.status(201).json({
            statusCode: 200,
            data: application,
            message: "Application Status Updated Successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedApplication = await Application.findByIdAndDelete(id);

    if (!deletedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};