import fs from "fs/promises";
import path from "path";
import { query } from "../src/db/query.js";

const migrationsDir = "./sql/migrations"

const files = (await fs.readdir(migrationsDir)).sort()

for (const file of files) {
    const sql = await fs.readFile(
        path.join(migrationsDir, file), "utf8"
    )

    console.log(`Running ${file}`);
    
    await query(sql)
}

console.log("Migrations completed")