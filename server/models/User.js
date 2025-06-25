const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
  },
  { timestamps: true }
);

/* hash password before every save */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* helper to check pw on login */
userSchema.methods.comparePw = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = model("User", userSchema);
