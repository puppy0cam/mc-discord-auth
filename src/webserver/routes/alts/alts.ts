/**
 * This is the alts endpoint for managing admin alt accounts.
 * @license GNU GPLv3
 * @author Dylan Hackworth <dhpf@pm.me>
 */
import express from 'express';
import { checkPostReq, postReq } from "./methods/post";
import { checkDelReq, delReq } from "./methods/delete";
import { checkGetReq, getReq } from "./methods/get";


export const altsRoute = express.Router();

// POST /newAlt (body integrity check)
altsRoute.post('/newAlt', checkPostReq);
// POST /newAlt endpoint handler
altsRoute.post('/newAlt', postReq);

// DELETE /delAlt (body integrity check)
altsRoute.delete('/delAlt', checkDelReq);
// DELETE /delAlt handler
altsRoute.delete('/delAlt', delReq);

// :owner path parameter
altsRoute.param('owner', checkGetReq)
// GET /getAltsOf/:owner handler
altsRoute.get('/getAltsOf/:owner', getReq);
