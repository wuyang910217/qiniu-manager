import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from 'moment';

import { Resources } from '../../api/resources.js';
import './main.html';

// Template.main.onCreated(function(){
//   let self = this;
//   self.autorun(function(){
//     self.subscribe('contents');
//   });
//   // Meteor.subscribe('contents');
// });

Template.main.helpers({
  isReady(sub){
    if (sub) {
      return FlowRouter.subsReady(sub);
    } else{
      return FlowRouter.subsReady();
    }
  },
  contents() {
    console.log('contents helper只执行一次');
    console.log(Resources.find().fetch());
    // 嵌套的时间排序
    return Resources.find({},{sort: {'contents.putTime': -1}});
  }
});

Template.content.helpers({
  // size(size) {
  //   if (size >= 1024*1024) {
  //     return size/1024/1024+'mb';
  //   }else {
  //     let num = size/1024;
  //     return num.toFixed(2)+ 'kb';
  //   }
  // },
  isImage(type){
    return type.indexOf('image/')>-1;
  },
  // date(time) {
  //   let unix=time.toString().slice(0,10);
  //   return moment.unix(unix).format("YYYY年MM月DD日");
  // },
  pathForDetail(){
    let params = {
      queryId: this._id
    };
    return FlowRouter.path('detail',params);
  }
});
