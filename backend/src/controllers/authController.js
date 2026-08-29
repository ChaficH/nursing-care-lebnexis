const service = require("../services/authService");

async function register(req, res) {
  const user = await service.registerUser(req.body);
  const token = service.signToken(user);
  res.status(201).json({ token, user });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = await service.loginUser(email, password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = service.signToken(user);
  return res.json({ token, user });
}

async function me(req, res) {
  const user = await service.getMe(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json({ user });
}

module.exports = { register, login, me };
