import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { isEmpty } from 'lodash/lang';
import { $ } from 'meteor/jquery';
import { Errors } from '../../api/errors.js';

import { BUCKET, ACCESS_KEY, SECRET_KEY, HOST_NAME } from '../../api/conf.js';

import './query.html';

Template.query.onCreated(function(){
  this.subscribe('error');
  Meteor.call('errors.clearAll');
});

Template.query.helpers({
  error(){
    let error = Errors.findOne({}) || {};
    console.log(error);
    if (!isEmpty(error)) {
      return error;
    }
  },
  hasError(){
    return Errors.find({}).count() !== 0;
  },
});

Template.query.events({
  'click #query' (event) {
    event.preventDefault();

    let bucket = $('input[name=bucket]').val();
    let ak = $('input[name=ak]').val();
    let sk = $('input[name=sk]').val();
    let hostname = $('input[name=hostname]').val();
    let prefix = $('input[name=prefix]').val();
    console.log(bucket, ak, sk, hostname,prefix);

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

    Meteor.call('errors.clearAll');
    Meteor.call('resources.clearAll', function(error) {
      if (error) {
        console.log('清空数据库失败' + error);
      }
      console.log('清空数据库成功');
    });

    Meteor.call('resources.add', bucket, ak, sk, hostname, prefix, function(err) {
      if (err) {
        console.log('resources.add---->error' + err);
      } else {
        console.log('resources.add---------success');
        FlowRouter.go('/main');
      }
    });
  }
});
