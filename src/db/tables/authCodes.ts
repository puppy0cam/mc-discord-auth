/**
 * @license GPL-3.0
 * @author Dylan Hackworth <dhpf@pm.me>
 */
import { Database } from "better-sqlite3";
import { v1 as uuid } from "uuid";

export type PendingAuthorisationInstance = {
    auth_code: string;
    mc_id: string;
}

export class PendingAuthorisations {
    private readonly tablename = "pending_authorisations";

    constructor(private readonly db: Database) {
        this.init();
    }

    /**
     * Gets the auth code associated wih a given Minecraft player id.
     */
    public getMinecraftPlayer(mc_id: string): PendingAuthorisationInstance | null {
        const row: PendingAuthorisationInstance | null = this.db.prepare<[string]>(
            `SELECT * FROM ${this.tablename} WHERE mc_id=?`,
        ).get(mc_id);

        return row;
    }

    public getAuthCode(auth_code: string): PendingAuthorisationInstance | null {
        const row: PendingAuthorisationInstance | null = this.db.prepare<[string]>(
            `SELECT * FROM ${this.tablename} WHERE auth_code=?`,
        ).get(auth_code);

        return row;
    }

    /**
     * Creates an auth code for a user.
     * If it already exists, the code will be generated as-is.
     */
    public assertAuthCode(mc_id: string): PendingAuthorisationInstance {
        const alreadyExistingCode = this.getMinecraftPlayer(mc_id);
        if (alreadyExistingCode !== null) return alreadyExistingCode;
        const auth_code = uuid().split('-')[0];
        this.db.prepare<[string, string]>(
            `INSERT INTO ${this.tablename} (mc_id,auth_code) VALUES (?,?)`,
        ).run(mc_id, auth_code);

        return {
            auth_code,
            mc_id,
        };
    }

    public init() {
        this.db.prepare<[]>(
            `CREATE TABLE IF NOT EXISTS ${this.tablename} (` + [
                "mc_id text UNIQUE NOT NULL",
                "auth_code text UNIQUE NOT NULL",
            ].join(',') + ")",
        ).run();
    }
}
