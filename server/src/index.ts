import "dotenv/config";
import app from "./app.js";
import { logger } from "./lib/logger.js";

const port = Number(process.env.PORT ?? 5000);
app.listen(port, (err?: Error) => {
  if (err) { logger.error({ err }, "Error starting server"); process.exit(1); }
  logger.info({ port }, `TypeFlow API listening on http://localhost:${port}`);
});
