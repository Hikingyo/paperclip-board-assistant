import winston from "winston";

/**
 * Centralized logging configuration using Winston
 * Provides a single logger instance across the application
 */

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = winston.createLogger({
  level: isDevelopment ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    isDevelopment
      ? winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, ...meta }) =>
              `${timestamp} [${level}]: ${message}${Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta, null, 2)}` : ""}`,
          ),
        )
      : winston.format.json(),
  ),
  defaultMeta: {
    service: "paperclip-mcp",
    environment: process.env.NODE_ENV || "production",
  },
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
});

// Attach logger to global namespace for convenience
declare global {
  // eslint-disable-next-line no-var
  var log: typeof logger;
}
globalThis.log = logger;

export default logger;
