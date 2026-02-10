import "dotenv/config";
import express from "express";
import cors from "cors";

import predictionsApiRoutes from "./api/routes/predictions.api.routes.js";
import racesApiRoutes from "./api/routes/races.api.routes.js";
import driversApiRoutes from "./api/routes/drivers.api.routes.js";
import pointsApiRoutes from "./api/routes/points.api.routes.js";
import circuitsApiRoutes from "./api/routes/circuits.api.routes.js";
import teamsApiRoutes from "./api/routes/teams.api.routes.js";
import usersApiRoutes from "./api/routes/users.api.routes.js";
import uploadApiRoutes from "./api/routes/upload.api.routes.js";
import notificationsRoutes from "./api/routes/notifications.routes.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

const app = express();

/* =========================
   CORS (PRIMERO SIEMPRE)
========================= */
const allowedOrigins = [
  process.env.FRONT_URL,
  "https://grandpick.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ CORS blocked origin:", origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

/* =========================
   MIDDLEWARES
========================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

/* =========================
   STATIC
========================= */
app.use("/api/static", express.static("uploads"));

/* =========================
   HEALTH CHECK (RAILWAY)
========================= */
app.get("/", (req, res) => {
  res.status(200).send("🚀 GrandPick API running");
});


/* =========================
   ROUTES
========================= */
app.use("/api/notifications", notificationsRoutes);

app.use("/", usersApiRoutes);
app.use("/", driversApiRoutes);
app.use("/", pointsApiRoutes);
app.use("/", predictionsApiRoutes);
app.use("/", racesApiRoutes);
app.use("/", circuitsApiRoutes);
app.use("/", teamsApiRoutes);
app.use("/", uploadApiRoutes);

/* =========================
   ERROR HANDLER
========================= */
app.use(errorHandler);

export default app;
