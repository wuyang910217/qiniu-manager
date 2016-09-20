import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Async } from 'meteor/meteorhacks:async';

import { Resources } from './resources.js';
import { BUCKET, ACCESS_KEY, SECRET_KEY, PIC_STYLE, HOST_NAME } from './conf.js';

import qiniu from 'qiniu';
// var qiniu = require('qiniu');
// //
qiniu.conf.ACCESS_KEY = ACCESS_KEY;
qiniu.conf.SECRET_KEY = SECRET_KEY;

const client = new qiniu.rs.Client();
let wrapQiniuUpload = Async.wrap(qiniu.io, 'put');
let wrapQiniuList = Async.wrap(qiniu.rsf, 'listPrefix');
let wrapQiniuClient = Async.wrap(client, ['remove','stat','move','copy']);

Meteor.methods({
  'resources.clearAll' () {
    Resources.remove({});
  },
  'resources.download' (bucket, key, hostname) {
    const policy = new qiniu.rs.GetPolicy();
    let url = hostname + '/' + key;
    let downloadUrl = policy.makeRequest(url);
    console.log(downloadUrl);
    return downloadUrl;
  },
  'resources.remove' (id, bucket, key) {
    const client = new qiniu.rs.Client();
    // client.remove(bucket, key, Meteor.bindEnvironment(function(err, ret) {
    //   if (!err) {
    //     console.log('Meteor method resources.remove success');
    //     Resources.remove({ _id: id });
    //   } else {
    //     // throw new Meteor.Error('error',err);
    //     console.log('Meteor method resources.remove---->');
    //     console.log(err);
    //   }
    // }));
    // const ret = wrapQiniuClient.remove(bucket,key);

    // return ret;
  },
  'resources.upload' (bucket, key, hostname, buffer) {
    let putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key);
    const token = putPolicy.token();

    const extra = new qiniu.io.PutExtra();

    buffer = new Buffer(buffer.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    // buffer = new Buffer(buffer,'base64');
    // console.log(buffer.toString());
    // console.log(buffer);

    qiniu.io.put(token, key, buffer, extra, Meteor.bindEnvironment(function(err, ret) {
      if (!err) {
        console.log('Meteor method resources.upload success');
        console.log(ret);
        const client = new qiniu.rs.Client();
        client.stat(bucket, key, Meteor.bindEnvironment(function(err, ret) {
          if (!err) {
            const url = hostname + '/' + key + '?' + PIC_STYLE;
            const data = {
              bucket: bucket,
              assess_key: ACCESS_KEY,
              secret_key: SECRET_KEY,
              hostname: hostname,
              createdAt: new Date(),
              contents: {
                key: key,
                hash: ret.hash,
                fsize: ret.fsize,
                mimeType: ret.mimeType,
                putTime: ret.putTime,
                url: url
              }
            };
            Resources.insert(data);
          } else {
            console.log('Meteor method resources.upload 查询stat出错');
            console.log(err);
          }
        }));
      } else {
        // throw new Meteor.Error('error',err);
        console.log('Meteor method resources.upload---->');
        console.log(err);
      }
    }));
  },
  'resources.add' (bucket, ak, sk, hostname, prefix) {
    qiniu.conf.ACCESS_KEY = ak;
    qiniu.conf.SECRET_KEY = sk;
    qiniu.rsf.listPrefix(bucket, prefix, null, null, null, Meteor.bindEnvironment(function(err, ret) {
      if (!err) {
        console.log('Meteor method resources.add success');
        for (var i = ret.items.length - 1; i >= 0; i--) {
          const url = hostname + '/' + ret.items[i].key + '?' + PIC_STYLE;
          const data = {
            bucket: bucket,
            assess_key: ak,
            secret_key: sk,
            hostname: hostname,
            createdAt: new Date(),
            contents: {
              key: ret.items[i].key,
              hash: ret.items[i].hash,
              fsize: ret.items[i].fsize,
              mimeType: ret.items[i].mimeType,
              putTime: ret.items[i].putTime,
              url: url
            }
          };
          Resources.insert(data);
        }
      } else {
        // 错误格式{ code: 631, error: 'no such bucket' }
        console.log('Meteor method resources.add---->');
        console.log(err);
      }
    }));
  },
  'resources.move' (id, bucket, key, dstbucket, deskey, hostname,) {
    const client = new qiniu.rs.Client();
    client.move(bucket, key, dstbucket, deskey, Meteor.bindEnvironment(function(err, ret) {
      if (!err) {
        console.log('Meteor method resources.move success');
        Resources.update(id, {
          $set: { 'bucket': dstbucket, 'hostname': hostname, 'contents.key': deskey }
        });
      } else {
        // throw new Meteor.Error('error',err);
        console.log('Meteor method resources.move---->');
        console.log(err);
      }
    }));
  },
  'resources.copy' (bucket, key, dstbucket, deskey, hostname) {
    const client = new qiniu.rs.Client();
    client.copy(bucket, key, dstbucket, deskey, Meteor.bindEnvironment(function(err, ret) {
      if (!err) {
        console.log('Meteor method resources.copy success');
        client.stat(dstbucket, deskey, Meteor.bindEnvironment(function(err, ret) {
          if (!err) {
            const url = hostname + '/' + deskey + '?' + PIC_STYLE;
            const data = {
              bucket: dstbucket,
              assess_key: ACCESS_KEY,
              secret_key: SECRET_KEY,
              hostname: hostname,
              createdAt: new Date(),
              contents: {
                key: deskey,
                hash: ret.hash,
                fsize: ret.fsize,
                mimeType: ret.mimeType,
                putTime: ret.putTime,
                url: url
              }
            };
            Resources.insert(data);
          } else {
            console.log('Meteor method resources.copy 查询stat出错');
            console.log(err);
          }
        }));
      } else {
        // throw new Meteor.Error('error',err);
        console.log('Meteor method resources.copy---->');
        console.log(err);
      }
    }));
  },
});
