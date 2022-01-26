export const register = (req, res) => {
  if (req.user) return res.status(201).json({ success: true, user: req.user });
  res.status(400).json({ success: false, user: null });
};

export const login = (req, res) => {
  if (req.user) return res.status(200).json({ success: true, user: req.user });
  res.status(400).json({ success: false, user: null });
};
