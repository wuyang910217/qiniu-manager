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
  'resources.remove'(id,bucket,key){
    const client = new qiniu.rs.Client();
    client.remove(bucket,key,Meteor.bindEnvironment(function(err,ret){
      if (!err) {
        console.log('Meteor method resources.remove success');
        Resources.remove({_id: id});
      } else{
        // throw new Meteor.Error('error',err);
        console.log('Meteor method resources.remove---->'+err);
      }
    }));
  },
  'resources.add' () {
    qiniu.rsf.listPrefix(BUCKET, null, null, null, null, Meteor.bindEnvironment(function(err, ret) {
      if (!err) {
        console.log('Meteor method resources.add success');
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
        console.log('Meteor method resources.add---->'+err);
      }
    }));
  },
  'resources.move'(id,bucket,key,dstbucket,deskey,){
    const client = new qiniu.rs.Client();
    client.move(bucket,key,dstbucket,deskey, Meteor.bindEnvironment(function(err,ret){
      if (!err) {
        console.log('Meteor method resources.move success');
        Resources.update(id,{
          $set: {'bucket': dstbucket,'contents.key': deskey}
        });
      } else{
        // throw new Meteor.Error('error',err);
        console.log('Meteor method resources.move---->'+err);
      }
    }));
  },
  'resources.copy'(bucket,key,dstbucket,deskey,){
    const client = new qiniu.rs.Client();
    client.copy(bucket,key,dstbucket,deskey, Meteor.bindEnvironment(function(err,ret){
      if (!err) {
        console.log('Meteor method resources.copy success');
        client.stat(dstbucket,deskey,Meteor.bindEnvironment(function(err,ret){
          if(!err){
            const url = HOST_NAME + '/' + deskey + '?' + PIC_STYLE;
            const data = {
              bucket: dstbucket,
              assess_key: ACCESS_KEY,
              secret_key: SECRET_KEY,
              hostname: HOST_NAME,
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
          }else{
            console.log('Meteor method resources.copy 查询stat出错'+err);
          }
        }));
      } else{
        // throw new Meteor.Error('error',err);
        console.log('Meteor method resources.copy---->'+err);
      }
    }));
  },
});
