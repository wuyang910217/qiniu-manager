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
let wrapQiniuList = Async.wrap(qiniu.rsf, ['listPrefix']);
let wrapQiniuClient = Async.wrap(client, ['remove', 'stat', 'move', 'copy']);

// 1.一开始用Async.wrap()没有成功，错误信息没法传到客户端；
// 2.后来新建了错误的数据库，在服务器段插入错误信息，并发布到客户端，然后处理；
// 3.最后尝试了try--catch 错误信息可以回传到客户端，比新建错误数据库方便；
// 4.并且客户端可以处理逻辑，比如删除失败，显示错误，删除成功，路由重定向到main page，
// 而使用第2步，无法重定向

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
    //用try--catch 可以返回错误到客户端
    try {
      wrapQiniuClient.remove(bucket, key);
      console.log('Meteor method resources.remove success');
      Resources.remove({ _id: id });
    } catch (err) {
      console.log(err);
      // 这里return不起作用
      // return err;
      throw new Meteor.Error('removeError', err);
    }
  },
  'resources.upload' (bucket, key, hostname, buffer) {
    let putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key);
    const token = putPolicy.token();

    const extra = new qiniu.io.PutExtra();

    buffer = new Buffer(buffer.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    // buffer = new Buffer(buffer,'base64');
    // console.log(buffer.toString());
    // console.log(buffer);
    try {
      wrapQiniuUpload.put(token, key, buffer, extra);
      console.log('Meteor method resources.upload success');
      try {
        const ret = wrapQiniuClient.stat(bucket, key);
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
      } catch (err) {
        console.log('Meteor method resources.upload 查询stat出错');
        console.log(err);
        throw new Meteor.Error('statError', err);
      }
    } catch (err) {
      console.log('Meteor method resources.upload---->error');
      console.log(err);
      throw new Meteor.Error('uploadError', err);
    }
  },
  'resources.add' (bucket, ak, sk, hostname, prefix) {
    qiniu.conf.ACCESS_KEY = ak;
    qiniu.conf.SECRET_KEY = sk;
    try {
      const ret = wrapQiniuList.listPrefix(bucket, prefix, null, null, null);
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
    } catch (err) {
      console.log('Meteor method resources.add---->error');
      console.log(err);
      throw new Meteor.Error('listError', err);
    }
  },
  'resources.move' (id, bucket, key, dstbucket, deskey, hostname) {
    try {
      wrapQiniuClient.move(bucket, key, dstbucket, deskey);
      console.log('Meteor method resources.move success');
      Resources.update(id, {
        $set: { 'bucket': dstbucket, 'hostname': hostname, 'contents.key': deskey }
      });
    } catch (err) {
      console.log('Meteor method resources.move---->error');
      console.log(err);
      throw new Meteor.Error('moveError', err);
    }
    // client.move(bucket, key, dstbucket, deskey, Meteor.bindEnvironment(function(err, ret) {
    //   if (!err) {
    //     console.log('Meteor method resources.move success');
    //     Resources.update(id, {
    //       $set: { 'bucket': dstbucket, 'hostname': hostname, 'contents.key': deskey }
    //     });
    //   } else {
    //     // throw new Meteor.Error('error',err);
    //     console.log('Meteor method resources.move---->');
    //     Errors.insert({ err: err.error, code: err.code });
    //     console.log(err);
    //   }
    // }));
  },
  'resources.copy' (bucket, key, dstbucket, deskey, hostname) {
    try {
      wrapQiniuClient.copy(bucket, key, dstbucket, deskey);
      console.log('Meteor method resources.copy success');
      try {
        const ret = wrapQiniuClient.stat(dstbucket, deskey);
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
      } catch (err) {
        console.log('Meteor method resources.copy 查询stat出错');
        console.log(err);
        throw new Meteor.Error('statError', err);
      }
    } catch (err) {
      console.log('Meteor method resources.copy---->error');
      console.log(err);
      throw new Meteor.Error('copyError', err);
    }
  },
});
