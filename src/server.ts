import app from "./app";
import { config } from "@/config/env";
import db from "@/config/database";

async function serverSetup(): Promise<void> {
  try {
    await db.raw("SELECT 1+1 AS result");
    console.log("Database connection established successfully.");

    const server = app.listen(config.PORT, () => {
      console.log(`Server running on http://localhost:${config.PORT}`);
      console.log(`Health check at http://localhost:${config.PORT}/health`);
    });

    const gracefulShutdown = async () => {
      console.log("stopping server...");
      server.close(async () => {
        console.log("HTTP server closed");
        await db.destroy();
        console.log("database connection closed. Server offline");
        process.exit(0);
      });
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    console.error("Error starting server: ", error);
    process.exit(1);
  }
}

void serverSetup();
