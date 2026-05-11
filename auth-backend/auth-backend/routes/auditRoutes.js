const express = require('express');
const router = express.Router();
const Audit = require('../models/Audit');
const { Op } = require('sequelize');


// ================= SEARCH =================
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';

    const rows = await Audit.findAll({
      where: {
        [Op.or]: [
          { id: isNaN(q) ? 0 : Number(q) },
          { oldData: { [Op.like]: `%${q}%` } },
          { newData: { [Op.like]: `%${q}%` } },
          { module: { [Op.like]: `%${q}%` } },
          { action: { [Op.like]: `%${q}%` } }
        ]
      },
      order: [['id', 'ASC']]
    });

    res.json(rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= SINGLE DATE FILTER =================
router.get('/date', async (req, res) => {
  try {
    const date = req.query.date;

    const rows = await Audit.findAll({
      where: {
        createdAt: {
          [Op.between]: [
            new Date(date + ' 00:00:00'),
            new Date(date + ' 23:59:59')
          ]
        }
      },
      order: [['id', 'ASC']]
    });

    res.json(rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= DATE RANGE FILTER =================
router.get('/range', async (req, res) => {
  try {
    const from = req.query.from;
    const to = req.query.to;

    const rows = await Audit.findAll({
      where: {
        createdAt: {
          [Op.between]: [
            new Date(from + ' 00:00:00'),
            new Date(to + ' 23:59:59')
          ]
        }
      },
      order: [['id', 'ASC']]
    });

    res.json(rows);

  } catch (error) {
    console.error('Range Filter Error:', error);
    res.status(500).json({ error: error.message });
  }
});


// ================= PAGINATION =================
router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { count, rows } = await Audit.findAndCountAll({
      order: [['id', 'ASC']],
      limit,
      offset
    });

    res.json({
      total: count,
      data: rows
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;