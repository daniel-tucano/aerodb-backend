import { Request, Response, NextFunction } from 'express'
const breezeMongodb = require('breeze-mongodb')

export default function (req: Request, res: Response, next: NextFunction) {
    const ODataMongoQuery = new breezeMongodb.MongoQuery(req.query)
    req.ODataFilter = ODataMongoQuery.filter
    next()
}