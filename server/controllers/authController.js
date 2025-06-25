const jwt   = require("jsonwebtoken");
const User  = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* ───────── Sign‑up ───────── */
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: "All fields required" });

    if (await User.findOne({ email }))
      return res.status(400).json({ msg: "Email already registered" });

    const user  = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ───────── Login ───────── */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePw(password)))
      return res.status(400).json({ msg: "Invalid credentials" });

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ───────── Logout (semantic) ───────── */
exports.logout = (_req, res) => {
  res.json({ msg: "Logged out (client must delete token)" });
};

/* ───────── Update profile ───────── */
exports.updateProfile = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name: req.body.name },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "User not found" });

    res.json({
      msg: "Profile updated",
      user: { id: updated._id, name: updated.name, email: updated.email },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ───────── Change password ───────── */
exports.changePassword = async (req, res) => {
  try {
    const { currentPw, newPw } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    if (!user || !(await user.comparePw(currentPw)))
      return res.status(400).json({ msg: "Current password incorrect" });

    user.password = newPw;
    await user.save();
    res.json({ msg: "Password updated" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
