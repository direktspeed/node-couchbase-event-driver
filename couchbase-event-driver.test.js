/**
 * Couchbase Event Driver
 */

const Couchbase = require('./couchbase-event-driver');
const debug = require('debug');
const couchbase = new Couchbase(require('couchbase').Mock);
//console.log(couchbase);
//var couchbase = require('couchbase').Mock;
var cluster = new couchbase.Cluster();
var bucket = cluster.openBucket();
//debug('')(bucket.upsert);
bucket.upsert('testdoc', { name: 'Frank' }, function originalCallback(err, result) {
  if (err) throw err;
  bucket.get('testdoc', function (err, result) {
    if (err) throw err;

    console.log(result.value);
    // {name: Frank}
  });
});