/**
 * Couchbase Event Driver
 */
const EventEmitter = require('events');

const debug = require('debug');
//TODO: patch n1ql update querys
/**
 *  you can supply a alternativ eventEngine via
 *  bucket.eventEngine = new socket() as long as it has emit and on methods
 *  defaults to eventEmitter
 */
class Couchbase {
  constructor(driver) {

    Object.assign(this, driver);
    this.Cluster = class Cluster extends driver.Cluster {
      constructor(...args) {
        super(...args);
        debug('constructor Cluster')();
        this.openBucket = (name,...args) => {
          const bucket = super.openBucket(name,...args);
          debug('patched: openBucket')(...args);
          bucket.eventEmitter = new EventEmitter();
          bucket.emit = (...args)=>bucket.eventEmitter.emit(...args);
          bucket.on = (...args)=>bucket.eventEmitter.on(...args);
          /*
          function patchCallback(action,id,doc,callback){
            debug('patchCallback')(action,id,doc,callback);
            return function emitingCallback(err, result) {              
              if (!err) {
                debug('emittingCallback')(action);
                bucket.emit(action, { bucket: name, id, doc, result });
              }
              debug('callback')(id,callback);
              callback(err,result);
            };
          }

          function patchMethod(method) {
            bucket[`_${method}`] = Object.assign(bucket[method]);    
            
            bucket[method] = (id, doc, ...rest) => {
              
              rest.push(patchCallback(method, id, doc, rest.pop()));
              debug(`patched: ${method}`)(id,doc,...rest);
              bucket[`_${method}`](id,doc,...rest);
            };
            debug('patchMethod')(method);
          }
                    
          ['insert','upsert','replace'].map(patchMethod);
          */
          //TODO: Patch Update remove          
          return bucket;
        };
      }
    };
  }
}

module.exports = Couchbase;