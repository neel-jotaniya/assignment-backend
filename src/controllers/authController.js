const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: "User already exists." });

        user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(201).json({ token, user: { id: user._id, name, email } });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const user = await User.findOne({ email });
        console.log(user);
        if (!user) return res.status(400).json({ error: "Invalid credentials" });
        console.log(1);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
        console.log(1);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        console.log(token);
        res.json({ token, user: { id: user._id, email } });

    } catch (error) {
        res.status(500).json({ error: error });
    }
};
