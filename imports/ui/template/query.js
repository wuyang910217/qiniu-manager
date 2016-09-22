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
    const instance = Template.instance();
    const error = instance.error.get('error');
    return error;
  },
  hasError() {
    const instance = Template.instance();
    const error = instance.error.get('error');
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
    const prefix = $('input[name=prefix]').val();
    console.log(bucket, ak, sk, hostname, prefix);

    if (isEmpty(bucket)) {
      bucket = BUCKET;
    }
    if (isEmpty(ak)) {
      ak = ACCESS_KEY;
    }
    if (isEmpty(sk)) {
      sk = SECRET_KEY;
    }
    if (isEmpty(hostname)) {
      hostname = HOST_NAME;
    }
    console.log(bucket, ak, sk, hostname);

    Meteor.call('resources.clearAll', (err) => {
      if (err) {
        console.log(`清空数据库失败 ${err}`);
        instance.error.set('error'.err.reason);
      }
      console.log('清空数据库成功');
    });

    Meteor.call('resources.add', bucket, ak, sk, hostname, prefix, (err) => {
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
