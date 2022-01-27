import User from "../models/userModel.js";

// @route     GET  /user/profile/:id
// desc         get current user profile
// @access  private

export const currentUserProfile = async (req, res, userId) => {
  try {
    const profile = await User.findById(userId).select("-password");
    if (!profile) {
      return res
        .status(400)
        .json({ success: false, message: "there is no profile for user" });
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "there is no profile for user" });
  }
};

// @route     POST  api/profile/:id
// desc          update user profile preferences
// @access  private

export const updateSettings = async (req, res, userId) => {
  const {
    theme,
    username,
    genderPref,
    bio,
    age,
    location,
    relationshipStatusPref,
    hobbies,
    autoDelete,
  } = req.body;

  try {
    const profileData = await User.findById(userId);

    profileData.displayName.status = username;
    profileData.gender.status = genderPref;
    profileData.headline.status = bio;
    profileData.dob.status = age;
    profileData.city.status = location;
    profileData.country.status = location;
    profileData.relationshipStatus.status = relationshipStatusPref;
    profileData.hobby.status = hobbies;
    profileData.settings.theme = theme;
    profileData.settings.autoDelete = autoDelete;
    const profile = await User.findByIdAndUpdate(
      userId,
      { $set: profileData },
      { new: true, upsert: true }
    ).select("-password");
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "there is no profile for user" });
  }
};

// @route     POST  api/profile/Personal/:id
// desc          update user profile Personal-data
// @access  private

export const updatePersonalData = async (req, res, userId) => {
  const {
    usernameData,
    genderData,
    bioData,
    ageData,
    locationData,
    relationshipStatusData,
    hobbiesData,
  } = req.body;

  try {
    const profileData = await User.findById(userId);

    profileData.displayName.value = usernameData;
    profileData.gender.value = genderData;
    profileData.headline.value = bioData;
    profileData.dob.value = ageData;
    profileData.city.value = locationData;
    profileData.country.value = locationData;

    profileData.relationshipStatus.value = relationshipStatusData;
    profileData.hobby.value = hobbiesData;
    const profile = await User.findByIdAndUpdate(
      userId,
      { $set: profileData },
      { new: true, upsert: true }
    ).select("-password");
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "there is no profile for user" });
  }
};

// @route     POST  api/profile/Personal/:id
// desc          update user profile Personal-data
// @access  private

const update