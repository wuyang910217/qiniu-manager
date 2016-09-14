import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Resources } from './resources.js';
import { BUCKET, ACCESS_KEY, SECRET_KEY, PIC_STYLE, HOST_NAME } from './conf.js';

import qiniu from 'qiniu';
// var qiniu = require('qiniu');
//
qiniu.conf.ACCESS_KEY = ACCESS_KEY;
qiniu.conf.SECRET_KEY = SECRET_KEY;

Meteor.methods({
  'resources.clearAll' () {
    Resources.remove({});
  },
  'resources.add' () {
    qiniu.rsf.listPrefix(BUCKET, null, null, null, null, Meteor.bindEnvironment(function(err, ret) {
      if (!err) {
        console.log(ret);
        for (var i = ret.items.length - 1; i >= 0; i--) {
          const url = HOST_NAME + '/' + ret.items[i].key + '?' + PIC_STYLE;
          const data = {
            bucket: BUCKET,
            assess_key: ACCESS_KEY,
            secret_key: SECRET_KEY,
            hostname: HOST_NAME,
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
        console.log(err);
      }
    }));
  },
  'resources.move'(key,dstbucket,deskey,){
    const client = new qiniu.rs.Client();
    client.move(BUCKET,key,dstbucket,deskey, Meteor.bindEnvironment(function(err,ret){
      if (!err) {
        console.log('move success');
      } else{
        console.log(err);
      }
    }));
  },
});
