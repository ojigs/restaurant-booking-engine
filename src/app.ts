import express, { Application, Response } from "express";
import cors from "cors";
import { ApiResponse } from "@/types/response";

const app: Application = express();

// middlewares
app.use(cors());
app.use(express.json());

app.get("/health", (_, res: Response) => {
  const response: ApiResponse<{ status: string; uptime: number }> = {
    success: true,
    data: {
      status: "UP",
      uptime: process.uptime(),
    },
  };
  res.status(200).json(response);
});

export default app;
