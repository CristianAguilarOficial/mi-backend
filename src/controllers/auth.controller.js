import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

// REGISTER USER
export const register = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    // Check if user already exists
    const userFound = await User.findOne({ email });
    if (userFound) {
      return res.status(400).json({ message: "The email is already in use" });
    }
    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10);
    // Create user
    const newUser = new User({ username, email, password: passwordHash });
    const userSaved = await newUser.save();
    // Create token
    const token = await createAccessToken({ id: userSaved._id });
    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    // Send response
    return res.status(201).json({
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      createdAt: userSaved.createdAt,
      updatedAt: userSaved.updatedAt,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// LOGIN USER
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(400).json({ message: "User not found" });
    }
    // Compare password
    const isMatch = await bcryptjs.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    // Create token
    const token = await createAccessToken({ id: userFound._id });
    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    // Send response
    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// LOGOUT USER
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

// PROFILE - protected route
export const profile = async (req, res) => {
  try {
    const userFound = await User.findById(req.user.id).select("-password");
    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(userFound);
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// VERIFY TOKEN
export const verifyToken = (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const userFound = await User.findById(decoded.id).select("-password");
      if (!userFound) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      return res.json(userFound);
    } catch (error) {
      console.error("Verify token error:", error);
      return res.status(500).json({ message: error.message });
    }
  });
};
