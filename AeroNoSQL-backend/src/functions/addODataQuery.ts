import { Request, Response, NextFunction } from 'express'
const breezeMongodb = require('breeze-mongodb')

export default function (req: Request, _res: Response, next: NextFunction) {
    const ODataMongoQuery = new breezeMongodb.MongoQuery(req.query)
    req.ODataFilter = ODataMongoQuery.filter
    if (ODataMongoQuery.options.sort) {
        req.ODataSort = ODataMongoQuery.options.sort
            .reduce( (ODataSort: Array<Object>, sortPair: Array<string>) => {
                ODataSort.push({ [sortPair[0]]: sortPair[1] })
                return ODataSort
            }, Array())
    }
    next()
}