import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { isEmpty } from 'lodash/lang';
import { $ } from 'meteor/jquery';
import { ReactiveDict } from 'meteor/reactive-dict';

import { BUCKET, ACCESS_KEY, SECRET_KEY, HOST_NAME } from '../../api/conf.js';

import './query.html';

Template.query.onCreated(function() {
  this.error = new ReactiveDict();
});

Template.query.helpers({
  error() {
    let instance = Template.instance();
    let error = instance.error.get('error');
    return error;
  },
  hasError() {
    let instance = Template.instance();
    let error = instance.error.get('error');
    return !isEmpty(error);
  },
});

Template.query.events({
  'click #query' (event, instance) {
    event.preventDefault();

    let bucket = $('input[name=bucket]').val();
    let ak = $('input[name=ak]').val();
    let sk = $('input[name=sk]').val();
    let hostname = $('input[name=hostname]').val();
    let prefix = $('input[name=prefix]').val();
    console.log(bucket, ak, sk, hostname, prefix);

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
        instance.error.set('error'.error.reason);
      }
      console.log('清空数据库成功');
    });

    Meteor.call('resources.add', bucket, ak, sk, hostname, prefix, function(err) {
      if (err) {
        console.log('resources.add---------error');
        console.log(err.reason);
        instance.error.set('error', err.reason);
      } else {
        console.log('resources.add---------success');
        FlowRouter.go('/main');
      }
    });
  }
});
