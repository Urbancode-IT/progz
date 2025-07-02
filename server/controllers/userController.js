//server/controllers/userController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validateEmail = require("../utils/validateEmail");
const Course = require("../models/Course");

// Generate JWT Token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      education,
      profession,
      experience,
      notes,
      instructorId,
    } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      education,
      profession,
      experience,
      notes,
    });

    await newUser.save();

    // Omit password in response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);
      res.json({ token, user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    if (updates.password) {
      // Hash password before saving
      const bcrypt = require("bcryptjs");
      updates.password = await bcrypt.hash(updates.password, 10);
    } else {
      delete updates.password; // remove empty password
    }
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user" });
  }
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};
// controllers/userController.js

exports.getUserToEditById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "enrolledCourses",
        populate: { path: "instructor", select: "name email" },
      });
    console.log("getMe block", user);
    res.status(200).json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = role ? { role } : {};
    const users = await User.find(filter).select("-password");

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(students);
    console.log("Fetched students", students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(instructors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkCreateUsers = async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "User array is required" });
    }

    // Validate all users first
    const validatedUsers = await Promise.all(
      users.map(async (user) => {
        if (!validateEmail(user.email)) {
          throw new Error(`Invalid email for user: ${user.email}`);
        }

        const exists = await User.findOne({ email: user.email });
        if (exists) {
          throw new Error(`User already exists: ${user.email}`);
        }

        return {
          ...user,
          password: await bcrypt.hash(user.password, 10),
        };
      })
    );

    const createdUsers = await User.insertMany(validatedUsers);

    res.status(201).json({
      message: `${createdUsers.length} users created successfully`,
      users: createdUsers.map((u) => {
        const userObj = u.toObject();
        delete userObj.password;
        return userObj;
      }),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getInstructorPayments = async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).populate(
    "enrolledStudents.student",
    "name email"
  );

  const payments = [];
  courses.forEach((course) => {
    course.enrolledStudents.forEach((enroll) => {
      payments.push({
        _id: enroll._id,
        courseName: course.courseName,
        student: enroll.student,
        courseFee: enroll.courseFee,
        instructorCommission: enroll.instructorCommission,
        paymentStatus: enroll.paymentStatus,
        paymentMode: enroll.paymentMode,
        transactionId: enroll.transactionId,
        processedBy: enroll.processedBy,
        paymentDate: enroll.paymentDate,
      });
    });
  });

  res.json(payments);
};
