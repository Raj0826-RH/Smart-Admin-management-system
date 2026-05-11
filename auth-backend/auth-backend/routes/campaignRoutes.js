const express = require('express');
const router = express.Router();

const { Op } = require('sequelize');
const Campaign = require('../models/Campaign');
const Audit = require('../models/Audit');


// ================= AUTO EXPIRE FUNCTION =================
async function updateExpiredCampaigns() {
  const today = new Date().toISOString().split('T')[0];

  await Campaign.update(
    { status: 'Inactive' },
    {
      where: {
        status: 'Active',
        endDate: {
          [Op.lt]: today
        }
      }
    }
  );
}


// ================= GET ALL + PAGINATION =================
router.get('/', async (req, res) => {
  try {
    await updateExpiredCampaigns();

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 1000;
    const offset = (page - 1) * limit;

    const { count, rows } = await Campaign.findAndCountAll({
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


// ================= CREATE =================
router.post('/add', async (req, res) => {
  try {
    const { name, des, startDate, endDate, status } = req.body;

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        error: 'End date must be greater than start date'
      });
    }

    const newCampaign = await Campaign.create({
      name,
      des,
      startDate,
      endDate,
      status
    });

    await Audit.create({
      oldData: null,
      newData: JSON.stringify(newCampaign),
      module: 'Campaign',
      action: 'Create'
    });

    res.status(201).json(newCampaign);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= UPDATE =================
router.put('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    const { name, des, startDate, endDate, status } = req.body;

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        error: 'End date must be greater than start date'
      });
    }

    const oldData = JSON.stringify(campaign);

    await campaign.update({
      name,
      des,
      startDate,
      endDate,
      status
    });

    await Audit.create({
      oldData,
      newData: JSON.stringify(campaign),
      module: 'Campaign',
      action: 'Update'
    });

    res.json(campaign);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= DELETE =================
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    const oldData = JSON.stringify(campaign);

    await campaign.destroy();

    await Audit.create({
      oldData,
      newData: null,
      module: 'Campaign',
      action: 'Delete'
    });

    res.json({
      message: 'Deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;