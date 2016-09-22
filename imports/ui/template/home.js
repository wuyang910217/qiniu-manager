import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { isEmpty } from 'lodash/lang';
import { $ } from 'meteor/jquery';
import { ReactiveDict } from 'meteor/reactive-dict';
import { BUCKET, ACCESS_KEY, SECRET_KEY, HOST_NAME } from '../../api/conf.js';

import '../layout/layout.html';
import './home.html';

Template.home.onCreated(function() {
  this.error = new ReactiveDict();
});

Template.home.helpers({
  error() {
    const instance = Template.instance();
    const error = instance.error.get('error');
    if (!isEmpty(error)) {
      $('.err').show();
      $('.err').fadeOut(5000);
      return error;
    }
  },
});

Template.home.events({
  'click #query-d' (event, instance) {
    event.preventDefault();

    Meteor.call('resources.clearAll', (err) => {
      if (err) {
        console.log(`清空数据库失败 ${err}`);
        instance.error.set('error', err.reason);
      }
      console.log('清空数据库成功');
    });

    Meteor.call('resources.add', BUCKET, ACCESS_KEY, SECRET_KEY, HOST_NAME, null, (err) => {
      if (err) {
        console.log('resources.add---------error');
        console.log(err.reason);
        instance.error.set('error', err.reason);
      } else {
        console.log('获取全部内容成功');
        FlowRouter.go('/main');
      }
    });
  },
  'click #query-n' (event) {
    event.preventDefault();
    FlowRouter.go('/query');
  }
});
