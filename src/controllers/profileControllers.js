import User from "../models/userModel.js";

// @route     GET  /user/profile/:id
// desc         get current user profile
// @access  private

export const currentUserProfile = async (req, res, userId) => {
  try {
    const profile = await User.findById(userId);
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
  const profileData = {};
  profileData.settings = {};
  profileData.displayName = {};
  profileData.gender = {};
  profileData.headline = {};
  profileData.dob = {};
  profileData.city = {};
  profileData.country = {};
  profileData.relationshipStatus = {};
  profileData.hobby = {};

  if (username) profileData.displayName.status = username;
  if (genderPref) profileData.gender.status = genderPref;
  if (bio) profileData.headline.status = bio;
  if (age) profileData.dob.status = age;
  if (location) profileData.city.status = location;
  if (location) profileData.country.status = location;
  if (relationshipStatusPref)
    profileData.relationshipStatus.status = relationshipStatusPref;
  if (hobbies) profileData.hobby.status = hobbies;
  if (theme) profileData.settings.theme = theme;
  if (autoDelete) profileData.settings.autoDelete = autoDelete;
  try {
    const profile = await User.findByIdAndUpdate(
      userId,
      { $set: profileData },
      { new: true, upsert: true }
    );
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
  const profileData = {};
  profileData.displayName = {};
  profileData.gender = {};
  profileData.headline = {};
  profileData.dob = {};
  profileData.city = {};
  profileData.country = {};
  profileData.relationshipStatus = {};
  profileData.hobby = {};

  if (usernameData) profileData.displayName.value = usernameData;
  if (genderData) profileData.gender.value = genderData;
  if (bioData) profileData.headline.value = bioData;
  if (ageData) profileData.dob.value = ageData;
  if (locationData) profileData.city.value = locationData;
  if (locationData) profileData.country.value = locationData;
  if (relationshipStatusData)
    profileData.relationshipStatus.value = relationshipStatusData;
  if (hobbiesData) profileData.hobby.value = hobbiesData;
  try {
    const profile = await User.findByIdAndUpdate(
      userId,
      { $set: profileData },
      { new: true, upsert: true }
    );
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "there is no profile for user" });
  }
};
