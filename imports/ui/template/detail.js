import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import moment from 'moment';
import { isEmpty } from 'lodash/lang';
import { startsWith } from 'lodash/string';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Resources } from '../../api/resources.js';
import { Errors } from '../../api/errors.js';
import './detail.html';

Template.detail.onCreated(function() {
  let self = this;
  this.content = new ReactiveDict();
  // self.autorun(function(){
  let queryId = FlowRouter.getParam('queryId');
  self.subscribe('detail', queryId);
  self.subscribe('error');
  Meteor.call('errors.clearAll');
  // });
});

Template.detail.onRendered(function(){

});
Template.detail.helpers({
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
  detail() {
    // 每次运行detail helper 都会执行一次
    let id = FlowRouter.getParam('queryId');
    let detailContent = Resources.findOne({ _id: id }) || {};
    if (isEmpty(detailContent)) {
      // render notFound 页面会闪过layout布局的内容，需要重新定义一个dataNotFound，
      // 作用于layout内部
      // BlazeLayout.render('notFound');
      console.log('empty++++');
      BlazeLayout.render('mainLayout', {main: 'dataNotFound'});
      // 用下面的方法需要定义/404路由，且当前路由变成/404,
      // 而不是localhost:3000/detail/2JM2p8Ngdddddddddddddd
      // FlowRouter.go('/404');
    } else{
      let instance = Template.instance();
      instance.content.set('content-detail', detailContent);
      console.log(instance.content.get('content-detail'));

      console.log('每次运行detail helper 都会执行一次');
      console.log('用{{#let}} {{/let}}包装后，只会执行一次');
      console.log(detailContent,detailContent.contents.mimeType);
      return detailContent;
    }
  },
  size(size) {
    if (size >= 1024 * 1024) {
      return size / 1024 / 1024 + 'mb';
    } else {
      let num = size / 1024;
      return num.toFixed(2) + 'kb';
    }
  },
  date(time) {
    let string = time + '';
    let unix = string.slice(0, 10);
    return moment.unix(unix).format("YYYY年MM月DD日");
  },
  isImage(type) {
    return startsWith(type, 'image/');
  },
});

Template.detail.events({
  'click #remove' (event, instance) {
    event.preventDefault();
    alert('你确定要删除此文件吗？');
    let id = FlowRouter.getParam('queryId');
    let bucket = instance.content.get('content-detail').bucket;
    let key = instance.content.get('content-detail').contents.key;

    Meteor.call('errors.clearAll');
    Meteor.call('resources.remove', id, bucket, key, function(err) {
      if (err) {
        console.log('resources.remove---->' + err);
      } else {
        console.log('resources.remove success');
        FlowRouter.go('/main');
      }
    });
  },
  'click #download' (event, instance) {
    event.preventDefault();

    let bucket = instance.content.get('content-detail').bucket;
    let key = instance.content.get('content-detail').contents.key;
    let hostname = instance.content.get('content-detail').hostname;

    Meteor.call('resources.download', bucket, key, hostname, function(err, ret) {
      if (err) {
        console.log('resources.download---->' + err);
      } else{
        console.log('resources.download success');
        console.log(ret);
        window.open(ret);
      }
    });
  },
  'click #move' (event, instance) {
    event.preventDefault();

    Meteor.call('errors.clearAll');
    let newBucket = $('input[name=bucket]').val().trim();
    let newhostname = $('input[name=hostname]').val().trim();
    let newKey = $('input[name=key]').val().trim();

    let bucket = instance.content.get('content-detail').bucket;
    let hostname = instance.content.get('content-detail').hostname;
    let key = instance.content.get('content-detail').contents.key;
    let id = FlowRouter.getParam('queryId');

    if (newBucket == '') {
      newBucket = bucket;
    }
    if (newhostname == '') {
      newhostname = hostname;
    }
    if (newKey == '') {
      alert('必须有新的文件名！');
    } else {
      Meteor.call('resources.move', id, bucket, key, newBucket, newKey, newhostname, function(err) {
        if (err) {
          console.log('resources.move---->' + err);
        }
        console.log('resources.move success');
      });
    }
  },
  'click #copy' (event, instance) {
    event.preventDefault();

    Meteor.call('errors.clearAll');
    let newBucket = $('input[name=bucket-copy]').val().trim();
    let newhostname = $('input[name=hostname1]').val().trim();
    let newKey = $('input[name=key-copy]').val().trim();

    let bucket = instance.content.get('content-detail').bucket;
    let hostname = instance.content.get('content-detail').hostname;
    let key = instance.content.get('content-detail').contents.key;
    // let id =FlowRouter.getParam('queryId');

    if (newBucket == '') {
      newBucket = bucket;
    }
    if (newhostname == '') {
      newhostname = hostname;
    }
    if (newKey == '') {
      alert('必须有新的文件名！');
    } else {
      Meteor.call('resources.copy', bucket, key, newBucket, newKey, newhostname, function(err) {
        if (err) {
          console.log('resources.copy---->' + err);
        }
        console.log('resources.copy success');
      });
    }
  }
});


