import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';

import { BUCKET, ACCESS_KEY, SECRET_KEY, HOST_NAME } from '../../api/conf.js';

import './query.html';

Template.query.events({
  'click #query' (event) {
    event.preventDefault();

    let bucket = $('input[name=bucket]').val();
    let ak = $('input[name=ak]').val();
    let sk = $('input[name=sk]').val();
    let hostname = $('input[name=hostname]').val();
    console.log(bucket, ak, sk, hostname);

    if (bucket === '') {
      bucket = BUCKET;
    }
    if (ak === '') {
      ak = ACCESS_KEY;
    }
    if (sk === '') {
      sk = SECRET_KEY;
    }
    if (hostname === '') {
      hostname = HOST_NAME;
    }
    console.log(bucket, ak, sk, hostname);

    Meteor.call('resources.clearAll', function(error) {
      if (error) {
        console.log('清空数据库失败' + error);
      }
      console.log('清空数据库成功');
    });

    Meteor.call('resources.add', bucket, ak, sk, hostname, function(err) {
      if (err) {
        console.log('resources.add---->error' + err);
      } else {
        console.log('resources.add---------success');
        FlowRouter.go('/main');
      }
    });
  }
});
