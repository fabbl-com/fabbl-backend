export const register = (req, res) => {
  if (req.user) return res.status(201).json({ succes: true, user: req.user });
  res.status(400).json({ succes: false, user: null });
};

export const login = (req, res) => {
  if (req.user) return res.status(200).json({ success: true, user: req.user });
  res.status(400).json({ succes: false, user: null });
};
