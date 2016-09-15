import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import moment from 'moment';

import { Resources } from '../../api/resources.js';
import './detail.html';

Template.detail.onCreated(function(){
  let self = this;
  self.autorun(function(){
    let queryId = FlowRouter.getParam('queryId');
    self.subscribe('detail',queryId);
  });
});

Template.detail.helpers({
  // isReady(){
  //   return !FlowRouter.subsReady('detail');
  // },
  detail() {
    // 每次运行detail helper 都会执行一次
    console.log(Resources.findOne());
    return Resources.findOne();
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
  'click .move'(event){
    event.preventDefault();
    Meteor.call('resources.move','test/graphql-shorthand-notation-cheat-sheet.png','wuyang','graphql-cheatsheet.png',function(err){
      if (err) {
        console.log('resources.move---->'+err);
      }
      console.log('resources.move success');
    });
  }
});
