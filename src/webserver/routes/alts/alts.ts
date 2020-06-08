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


altsRoute.post('/newAlt', checkPostReq);
altsRoute.post('/newAlt', postReq);

altsRoute.delete('/delAlt', checkDelReq);
altsRoute.delete('/delAlt', delReq);

altsRoute.param('owner', checkGetReq)
altsRoute.get('/getAltsOf/:owner', getReq);
