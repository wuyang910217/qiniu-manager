import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { startsWith } from 'lodash/string';
import { Resources } from '../../api/resources.js';
import './main.html';

Template.main.onCreated(function(){
  this.count = new ReactiveVar(0);
  this.skip = new ReactiveVar(0);
});

Template.main.helpers({
  isReady(sub) {
    if (sub) {
      return FlowRouter.subsReady(sub);
    }
    return FlowRouter.subsReady();
  },
  contents() {
    console.log('contents helper只执行一次');
    console.log(Resources.find().fetch());
    // 嵌套的时间排序
    return Resources.find({}, { sort: { 'contents.putTime': -1 } });
  },
  hasCont() {
    const count = Resources.find().count();
    const skip = Template.instance().skip.get();
    console.log(count,skip);
    return count>=skip;
  }
});

Template.content.helpers({
  isImage(type) {
    return startsWith(type, 'image/');
  },
  // 从这里得到id，并存到params里，其他地方都可以调用
  pathForDetail() {
    const params = {
      queryId: this._id
    };
    return FlowRouter.path('detail', params);
  }
});

Template.main.events({
  'click #more'(event,instance) {
    event.preventDefault();

    instance.count.set(instance.count.get()+1);
    const limit = 20;
    const skip = instance.count.get()*limit;
    instance.skip.set(skip);
    Meteor.subscribe('contents', limit, skip);
  },
});
