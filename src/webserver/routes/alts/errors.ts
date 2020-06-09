/**
 * These are all the errors that can occur during alt management
 * @license GNU GPLv3
 * @author Dylan Hackworth <dhpf@pm.me>
 */
import { WebServerError } from "../../errors";

export const noOwner: WebServerError = {
  errcode: "NO_OWNER",
  message: "An owner attribute was not provided"
}

export const ownerType: WebServerError = {
  errcode: "OWNER_TYPE_ERROR",
  message: "The owner attribute provided is not a string type"
}

export const altAlreadyAdded: WebServerError = {
  errcode: "ALT_ALREADY_ADDED",
  message: "The alt provided is already stored in the database"
}
