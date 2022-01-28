import User from "../models/userModel.js";

// @route     GET  /user/profile/:id
// desc         get current user profile
// @access  private

export const currentUserProfile = async (req, res) => {
  const userId = req.params.id;
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

export const updateSettings = async (req, res) => {
  const userId = req.params.id;
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
      { new: true }
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

export const updatePersonalData = async (req, res) => {
  const userId = req.params.id;
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
      { new: true }
    ).select("-password");
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "there is no profile for user" });
  }
};

// @route     post  /user/add/friend/:id
// desc         add friends
// @access  private

export const addFriend = async (req, res) => {
  const userId = req.params.id;
  const id = { userId: req.body.userId };
  try {
    const profile = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { friendsList: id } },
      { new: true }
    );
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "unable to add friends" });
  }
};

// @route     post  /user/add/block/:id
// desc         add block
// @access  private

export const blockFriend = async (req, res) => {
  const userId = req.params.id;
  const block = { userId: req.body.userId };
  try {
    const profile = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { blocked: block },
      },
      { new: true }
    );
    // await profile.save();
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "unable to block" });
  }
};

// @route     post  /user/add/sent-request/:id
// desc         add sent request
// @access  private

export const sentRequest = async (req, res) => {
  const userId = req.params.id;
  const id = { userId: req.body.userId };
  try {
    const profile = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { sentRequest: id } },
      { new: true }
    );
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "unable to sentRequest" });
  }
};

// @route     post  /user/add/received-Request/:id
// desc         add receivedRequest
// @access  private

export const receivedRequest = async (req, res) => {
  const userId = req.params.id;
  const id = { userId: req.body.userId };
  try {
    const profile = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { receivedRequest: id } },
      { new: true }
    );
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "unable to received-Request" });
  }
};

// @route     post  /user/remove/friend/:id
// desc         remove friends
// @access  private

export const removeFriend = async (req, res) => {
  const userId = req.params.id;
  const id = { userId: req.body.userId };
  try {
    const profile = await User.findByIdAndUpdate(
      userId,
      { $pull: { friendsList: id } },
      { new: true }
    );
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "unable to  unfriends" });
  }
};

// @route     post  /user/remove/block/:id
// desc         remove block
// @access  private

export const removeBlock = async (req, res) => {
  const userId = req.params.id;
  const block = { userId: req.body.userId };
  try {
    const profile = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { blocked: block },
      },
      { new: true }
    );
    // await profile.save();
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "unable to unblock" });
  }
};
