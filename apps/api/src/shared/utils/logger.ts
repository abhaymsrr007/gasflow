export const logger = {
  info: (message: string) => {
    console.log(`\x1b[36m[INFO]\x1b[0m ${new Date().toISOString()} - ${message}`);
  },
  success: (message: string) => {
    console.log(`\x1b[32m[SUCCESS]\x1b[0m ${new Date().toISOString()} - ${message}`);
  },
  warn: (message: string) => {
    console.warn(`\x1b[33m[WARN]\x1b[0m ${new Date().toISOString()} - ${message}`);
  },
  error: (message: string, error?: any) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${new Date().toISOString()} - ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error(error.stack);
      } else {
        console.error(error);
      }
    }
  },
};