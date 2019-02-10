/**
 * Couchbase Event Driver
 */
const EventEmitter = require('events');
const couchbase = require('couchbase');

//TODO: patch n1ql update querys
/**
 *  you can supply a alternativ eventEngine via
 *  bucket.eventEngine = new socket() as long as it has emit and on methods
 *  defaults to eventEmitter
 */
class Couchbase {
    constructor() {
        Object.assign(this, couchbase)
        this.Cluster = class Cluster extends couchbase.Cluster {
            constructor(...args) {
                super(...args)
                this.openBucket = (name,...args) => {
                    const bucket = super.openBucket(name,...args);
                   
                    bucket.eventEmitter = new EventEmitter();
                    bucket.emit = (...args)=>bucket.eventEmitter.emit(...args)
                    bucket.on = (...args)=>bucket.eventEmitter.on(...args)

                    function patchCallback(action,id,doc,callback){
                        return function emitingCallback(err,result) {
                            if (!err) {
                                bucket.emit(action, { bucket: name, id, doc ,result })
                            }
                            callback(err,result)
                        }
                    }

                    function patchMethod(method) {
                        bucket[`_${method}`] = bucket[method];    
                        bucket[method] = (id,doc,...rest) => {
                            rest.push(patchCallback(method,id, doc, rest.pop()))
                            return bucket[`_${method}`](id,doc,...rest)
                        }
                    }
                    
                    ['insert','upsert','replace'].map(patchMethod)
                    
                    return bucket
                }
            }
        }
    }
}

module.exports = cluster;