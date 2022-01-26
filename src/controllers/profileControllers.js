import express from "express";
import User from "../models/userModel"

// @route     GET  /user/profile/:id
// desc         get current user profile
// @access  private 

export const currentUserProfile= async (req, res) => {
    try {
      const profile = await User.findById( req.params.user_id  );
      if (!profile) {
        return res.status(400).json({ success:false,message: 'there is no profile for user' });
      }
      res.status(200).json({success: true, profile});
    } catch (err) {
      console.error(err);
      res.status(500).json({ success:false,message:'there is no profile for user' });
    }
  }

  // @route     POST  api/profile  (request type and endpoint)
// desc         add and update user profile
// @access  private 

export const updateUserProfile = async (req, res) => {
    const {headline,displayName,gender,dob,relationshipStatus,gender,Location}=req.body;
    const profileFields = {};
    
}