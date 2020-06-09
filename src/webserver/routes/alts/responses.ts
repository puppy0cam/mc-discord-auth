/**
 * These are all the possible successful responses
 * @LICENSE GPL-3.0
 * @author Dylan Hackworth <dhpf@pm.me>
 */
import { AltAcc } from "../../../db/tables/alts";

export type isDeletedRes = {
  is_deleted: boolean;
}

export type altAccs = {
  alt_accs: AltAcc[];
}
