const fs = require("fs");
const path = require("path");
const winston = require("winston");

const dateFormat = () => new Date().toLocaleString();

const isProd = process.env.NODE_ENV === "production";

const baseLogDir = process.env.LOG_PATH || "logs";
const logDir = isProd ? "/tmp/logs" : path.resolve(__dirname, "..", baseLogDir);

try {
  fs.mkdirSync(logDir, { recursive: true });
} catch (err) {
  if (err.code !== "EACCES" && err.code !== "EROFS") {
    console.error("🛑 NO FOLDER:", err);
  }
}

class loggerServices {
  constructor(topic) {
    const filename = path.join(logDir, `${topic}.log`);

    const transports = [new winston.transports.Console()];

    if (!isProd || (isProd && fs.existsSync("/tmp"))) {
      transports.push(new winston.transports.File({ filename }));
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.printf((info) => {
        let message = `${dateFormat()} | ${info.level.toUpperCase()} | ${
          info.message
        }`;
        if (info.obj) {
          message += ` | ${JSON.stringify(info.obj)}`;
        }
        return message;
      }),
      transports,
    });
  }

  async info(message, obj) {
    this.logger.log("info", message, obj ? { obj } : {});
  }

  async error(message, obj) {
    this.logger.log("error", message, obj ? { obj } : {});
  }

  async debug(message, obj) {
    this.logger.log("debug", message, obj ? { obj } : {});
  }
}

module.exports = loggerServices;
