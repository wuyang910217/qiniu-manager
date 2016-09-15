import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import moment from 'moment';

import { Resources } from '../../api/resources.js';
import './detail.html';

Template.detail.onCreated(function(){
  this.content = new ReactiveDict();
  let self = this;
  // self.autorun(function(){
  let queryId = FlowRouter.getParam('queryId');
  self.subscribe('detail',queryId);
  // });
});

Template.detail.helpers({
  detail() {
    // 每次运行detail helper 都会执行一次
    let id =FlowRouter.getParam('queryId');
    let detailContent = Resources.findOne({_id: id});

    let instance = Template.instance();
    instance.content.set('content-detail',detailContent);
    console.log(instance.content.get('content-detail'));

    console.log('每次运行detail helper 都会执行一次');
    console.log('用{{#let}} {{/let}}包装后，只会执行一次');
    console.log(detailContent.contents.key,detailContent.contents.mimeType);
    return detailContent;
  },
  size(size) {
    if (size >= 1024*1024) {
      return size/1024/1024+'mb';
    }else {
      let num = size/1024;
      return num.toFixed(2)+ 'kb';
    }
  },
  date(time) {
    let string=time+'';
    let unix=string.slice(0,10);
    return moment.unix(unix).format("YYYY年MM月DD日");
  },
  isImage(type) {
    return type.indexOf('image/')>-1;
  },
});

Template.detail.events({
  'click .back'(event){
    event.preventDefault();
    FlowRouter.go('/main');
  },
  'click .remove'(event,instance){
    event.preventDefault();
    alert('你确定要删除此文件吗？');
    let id = FlowRouter.getParam('queryId');
    let bucket = instance.content.get('content-detail').bucket;
    let key = instance.content.get('content-detail').contents.key;

    Meteor.call('resources.remove',id,bucket,key,function(err){
      if (err) {
        console.log('resources.remove---->'+err);
      }
      console.log('resources.remove success');
      FlowRouter.go('/main');
    });
  },
  'click .download'(event,instance){
    event.preventDefault();

    let bucket = instance.content.get('content-detail').bucket;
    let key = instance.content.get('content-detail').contents.key;

    Meteor.call('resources.download',bucket,key,function(err,ret){
      if (err) {
        console.log('resources.download---->'+err);
      }
      console.log('resources.download success');
      console.log(ret);
      window.open(ret);
    });
  },
  'click .move'(event,instance){
    event.preventDefault();

    let newBucket = $('input[name=bucket]').val().trim();
    let newKey = $('input[name=key]').val().trim();

    let bucket = instance.content.get('content-detail').bucket;
    let key = instance.content.get('content-detail').contents.key;
    let id =FlowRouter.getParam('queryId');

    if (newBucket == '') {
      newBucket = bucket;
    }
    if (newKey == '') {
      alert('必须有新的文件名！');
    } else{
      Meteor.call('resources.move',id,bucket,key,newBucket,newKey,function(err){
      if (err) {
        console.log('resources.move---->'+err);
      }
      console.log('resources.move success');
    });
    }
  },
  'click .copy'(event,instance){
    event.preventDefault();

    let newBucket = $('input[name=bucket-copy]').val().trim();
    let newKey = $('input[name=key-copy]').val().trim();

    let bucket = instance.content.get('content-detail').bucket;
    let key = instance.content.get('content-detail').contents.key;
    // let id =FlowRouter.getParam('queryId');

    if (newBucket == '') {
      newBucket = bucket;
    }
    if (newKey == '') {
      alert('必须有新的文件名！');
    } else{
      Meteor.call('resources.copy',bucket,key,newBucket,newKey,function(err){
      if (err) {
        console.log('resources.copy---->'+err);
      }
      console.log('resources.copy success');
    });
    }
  }
});
