import "dotenv/config";
import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";

const app: Application = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
    const allowed = !origin || allowedOrigins.includes(origin);
    cb(allowed ? null : new Error(`CORS blocked for origin: ${origin}`), allowed);
  },
  credentials: true,
};

app.use(cors(corsOptions));

if (process.env.NODE_ENV === "development") {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "ASTU SmartDesk API is running",
    timestamp: new Date(),
    version: "1.0.0",
  });
});

app.get("/api/status", (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: "operational",
    timestamp: new Date(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled server error:", err?.message || err);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors || {}).map((e: any) => e.message);
    res.status(400).json({ success: false, message: "Validation Error", errors });
    return;
  }

  if (err.code === 11000) {
    const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : "field";
    res.status(400).json({ success: false, message: `${field} already exists` });
    return;
  }

  if (err.name === "JsonWebTokenError") {
    res.status(401).json({ success: false, message: "Invalid token" });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({ success: false, message: "Token expired" });
    return;
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

const PORT = Number(process.env.PORT || 5000);

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`ASTU SmartDesk backend listening on http://localhost:${PORT}`);
    console.log(`Allowed frontend origins: ${allowedOrigins.join(", ")}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

process.on("unhandledRejection", (err: unknown) => {
  console.error("Unhandled promise rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});
