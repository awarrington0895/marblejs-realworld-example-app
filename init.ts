import { promisify } from "util";
import { execSync, exec } from "child_process";

const execP = promisify(exec);

Promise.all([
  execP("docker-compose up -d"),
  execP("cat .env.sample > .env"),
]).then(() => {
  execSync("gp await-port 5432");
  execSync("npm run db:migrate");
});
