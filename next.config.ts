import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: "postgresql://neondb_owner:npg_t9uwZUz4yofb@ep-plain-bush-a5ogzpwi-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
    EMAIL_SERVER_HOST: "smtp.gmail.com",
    EMAIL_SERVER_PORT: "465",
    EMAIL_SERVER_USER: "dhanielbrandao2@gmail.com",
    EMAIL_SERVER_PASSWORD: "oane rgxr wxry yzsn",
    EMAIL_SERVER_FROM: "dhanielbrandao2@gmail.com"
  }
};

export default nextConfig;
