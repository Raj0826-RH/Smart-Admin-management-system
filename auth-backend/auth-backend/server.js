console.log("🚀 Server starting...");

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const { connectDB, sequelize } = require('./config/db');

// Routes
const otpRoutes = require('./routes/otpRoutes');
const UserDetailsRoutes = require('./routes/UserDetailsRoutes');
const authRoutes = require('./routes/authRoutes');
const auditRoutes = require('./routes/auditRoutes');
const campaignRoutes = require('./routes/campaignRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// ================= ROUTES =================
app.use('/api/otp', otpRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user-details', UserDetailsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/campaign', campaignRoutes);

// ================= TEST =================
app.get('/', (req, res) => {
  res.send("API Running 🚀");
});

// ================= PORT =================
const PORT = process.env.PORT || 5000;

// ================= START SERVER =================
connectDB()
  .then(() => sequelize.sync({ alter: true }))

  .then(async () => {
    // Auto update old audit rows only for previous blank records
    await sequelize.query(`
      UPDATE audit_logs
      SET 
        action = CASE
          WHEN oldData IS NULL AND newData IS NOT NULL THEN 'Create'
          WHEN oldData IS NOT NULL AND newData IS NULL THEN 'Delete'
          ELSE 'Update'
        END,
        module = CASE
          WHEN module IS NULL OR module = '-' THEN 'Users'
          ELSE module
        END
      WHERE module IS NULL OR module = '-'
    `);

    console.log("✅ Old audit rows updated automatically");
  })

  .then(() => {
    console.log("✅ Tables synced");

    app.listen(PORT, () => {
      console.log(`🔥 Server running on port ${PORT}`);
    });
  })

  .catch((err) => {
    console.error("❌ Error:", err);
  });