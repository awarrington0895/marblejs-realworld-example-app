import { promisify } from "util";
import { execSync, exec } from "child_process";

const execP = promisify(exec);

Promise.all([
  execP("npm install"),
  execP("docker-compose up -d"),
  execP("cat .env.sample > .env"),
]).then(() => {
  execSync("npm run db:migrate");
});
