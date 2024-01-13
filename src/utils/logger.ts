import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, json, prettyPrint, cli, errors } = format;

export const logger = createLogger({
	level: "info",
	format: combine(
		errors({
			stack: true,
		}),
		timestamp({
			format: "YYYY-MM-DD HH:mm:ss",
		}),
		json(),
		prettyPrint(),
	),
	transports: [
		new DailyRotateFile({
			filename: "logs/error-%DATE%.log",
			datePattern: "YYYY-MM-DD",
			zippedArchive: false,
			maxSize: "20m",
			maxFiles: "14d",
			level: "error",
		}),
		new DailyRotateFile({
			filename: "logs/info-%DATE%.log",
			datePattern: "YYYY-MM-DD",
			zippedArchive: false,
			maxSize: "20m",
			maxFiles: "14d",
		}),
	],
});

if (process.env.NODE_ENV !== "production") {
	logger.add(
		new transports.Console({
			format: cli(),
		}),
	);
}
