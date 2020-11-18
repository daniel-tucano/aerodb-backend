import * as express from 'express';
import { auth } from 'firebase-admin'

declare global {
    namespace Express {
        export interface Request {
            decodedIdToken?: auth.DecodedIdToken;
            ODataFilter: Object,
            ODataSort: Object[] | undefined
        }
    }
}