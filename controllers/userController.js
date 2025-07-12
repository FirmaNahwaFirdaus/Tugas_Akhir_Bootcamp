const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ======= REGISTER =======
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });

    const exist = await User.findOne({ email });
    if (exist)
      return res.status(409).json({ message: 'Email sudah terdaftar' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      status: 'inactive',
      is_deleted: false
    });

    res.status(201).json({ message: 'Berhasil register', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======= LOGIN =======
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email dan password wajib diisi' });

    const user = await User.findOne({ email, is_deleted: false });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Login gagal' });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({ message: 'Berhasil login', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======= GET USER =======
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user || user.is_deleted)
      return res.status(404).json({ message: 'User tidak ditemukan' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======= UPDATE USER =======
exports.updateUser = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name },
      { new: true }
    );
    res.json({ message: 'Berhasil update', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======= SET STATUS ACTIVE/INACTIVE =======
exports.setStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status))
      return res.status(400).json({ message: 'Status tidak valid' });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { status },
      { new: true }
    );
    res.json({ message: 'Status diperbarui', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======= SOFT DELETE =======
exports.softDelete = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, { is_deleted: true });
    res.json({ message: 'User dihapus (soft delete)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
