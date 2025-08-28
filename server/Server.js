require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express(); // <-- app initialized first

// ----- Utils / Logger -----
const logger = require("./utils/logger");

// ===== Security middleware =====
app.use(
  helmet({
    // Default helmet is fine for APIs. If you ever serve images/assets cross-site, you may tweak CORP/CSP here.
  })
);

// ===== Rate limiting =====
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ===== CORS (fix) =====
// Allow your Next dev origin(s). Add prod domains as needed via env.
const ALLOW_ORIGINS = (
  process.env.CORS_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    // allow server-to-server/no-origin and whitelisted origins
    if (!origin || ALLOW_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-user-id",
  ],
  credentials: true, // set to true only if you actually use cookies
};

// Handle preflight first
app.options("*", cors(corsOptions));
// Main CORS
app.use(cors(corsOptions));

// ===== Parsers =====
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ===== HTTP request logging =====
app.use(morgan("combined", { stream: logger.stream }));

// ===== DB & Services =====
const connectDB = require("./config/db");
connectDB();

const analyticsService = require("./services/analyticsService");
analyticsService.init();

// ===== Health check (move BEFORE 404) =====
app.get("/", (req, res) => {
  res.json({
    message: "Freetym backend is running",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Scheduled jobs
require("./services/fetchInstagramReels");
// (fixed extra slash)
require("./services/fetchYoutubeReels");

// ===== Routes =====
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes); // done

const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);

const planRoutes = require("./routes/plan");
app.use("/api/plans", planRoutes); // admin

const profileRoutes = require("./routes/profile");
app.use("/api/profile", profileRoutes); // done

const subscriptionRoutes = require("./routes/subscription");
app.use("/api/subscription", subscriptionRoutes);

const campaignRoutes = require("./routes/campaign");
app.use("/api/campaigns", campaignRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

// NOTE: base path is singular: /
const influencerRoutes = require("./routes/influencer");
app.use("/api/influencer", influencerRoutes);

const brandRoutes = require("./routes/brand");
app.use("/api/brand", brandRoutes);

const applicationRoutes = require("./routes/application");
app.use("/api/applications", applicationRoutes);

const otpRoutes = require("./routes/otp");
app.use("/api/otp", otpRoutes);

const socialRoutes = require("./routes/social");
app.use("/api/social", socialRoutes);

// Public (landing)
const publicRoutes = require("./routes/public");
app.use("/api/public", publicRoutes);

// Wallet (KYC/balance)
const walletRoutes = require("./routes/wallet");
app.use("/api/wallet", walletRoutes);

// Reels (inspiration)
const reelsRoutes = require("./routes/reels");
app.use("/api/reels", reelsRoutes);

// Health monitoring routes (if any extra under /api/health)
const healthRoutes = require("./routes/health");
app.use("/api/health", healthRoutes);

// ===== Error handling =====
const { errorHandler } = require("./middleware/errorHandler");
app.use(errorHandler);

// ===== 404 handler (keep LAST) =====
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Scheduled jobs
require("./services/fetchInstagramReels");
// (fixed extra slash)
require("./services/fetchYoutubeReels");
