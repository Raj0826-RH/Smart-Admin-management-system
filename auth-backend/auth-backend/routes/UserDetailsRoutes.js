// routes/UserDetailsRoutes.js

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const UserDetails = require('../models/UserDetails');
const Audit = require('../models/Audit');


// ================= SEARCH USERS =================
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';

    const users = await UserDetails.findAll({
      where: {
        [Op.or]: [
          { id: isNaN(q) ? 0 : Number(q) },
          { username: { [Op.like]: `%${q}%` } },
          { firstname: { [Op.like]: `%${q}%` } },
          { lastname: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
          { phone: { [Op.like]: `%${q}%` } },
          { city: { [Op.like]: `%${q}%` } },
          { country: { [Op.like]: `%${q}%` } },
          { state: { [Op.like]: `%${q}%` } }
        ]
      },
      order: [['id', 'DESC']]
    });

    res.json({
      data: users,
      total: users.length
    });

  } catch (error) {
    console.error('SEARCH ERROR:', error);
    res.status(500).json({
      error: 'Search failed'
    });
  }
});


// ================= GET USERS WITH PAGINATION =================
router.get('/', async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 5;

    const offset = (page - 1) * limit;

    const { count, rows } = await UserDetails.findAndCountAll({
      order: [['id', 'DESC']],
      limit,
      offset
    });

    res.json({
      users: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to fetch users'
    });
  }
});


// ================= CREATE USER =================
router.post('/adduser', async (req, res) => {
  try {
    const {
      username,
      firstname,
      lastname,
      email,
      phone,
      state,
      city,
      country,
      zipcode,
      status
    } = req.body;

    const name = `${firstname || ''} ${lastname || ''}`.trim();

    if (!firstname || !email || !phone) {
      return res.status(400).json({
        error: "Firstname, Email and Phone are required"
      });
    }

    const newUser = await UserDetails.create({
      name,
      username,
      firstname,
      lastname,
      email,
      phone,
      state,
      city,
      country,
      zipcode,
      status,
      action: 'CREATE'
    });

    await Audit.create({
      oldData: null,
      newData: JSON.stringify(newUser),
      module: 'Users',
      action: 'Create'
    });

    res.status(201).json({
      message: "User created successfully",
      data: newUser
    });

  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({ error: "Create failed" });
  }
});


// ================= UPDATE USER =================
router.put('/:id', async (req, res) => {
  try {
    const user = await UserDetails.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    const {
      username,
      firstname,
      lastname,
      email,
      phone,
      state,
      city,
      country,
      zipcode,
      status
    } = req.body;

    const name = `${firstname || ''} ${lastname || ''}`.trim();
    const oldData = JSON.stringify(user);

    await user.update({
      name,
      username,
      firstname,
      lastname,
      email,
      phone,
      state,
      city,
      country,
      zipcode,
      status,
      action: 'UPDATE'
    });

    await Audit.create({
      oldData,
      newData: JSON.stringify(user),
      module: 'Users',
      action: 'Update'
    });

    res.json({
      message: "User updated successfully",
      data: user
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ error: "Update failed" });
  }
});


// ================= DELETE USER =================
router.delete('/:id', async (req, res) => {
  try {
    const user = await UserDetails.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    const oldData = JSON.stringify(user);

    await user.destroy();

    await Audit.create({
      oldData,
      newData: null,
      module: 'Users',
      action: 'Delete'
    });

    res.json({
      message: "Deleted successfully"
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;