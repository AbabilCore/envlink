import { config } from "dotenv";
import { envsafe, str, num } from "envsafe";
config();

const ENV = envsafe({
  PORT: num({ default: 3000 }),
  NODE_ENV: str({ choices: ["development", "production", "preview"] }),
  PROD_SITE_URL: str(),
  DB_URI: str(),
  CRON_SECRET: str({ default: "", allowEmpty: true }),
});

export default ENV;
