import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import '../layout/layout.html';
import './home.html';

Template.home.onCreated(function(){
  this.error = new ReactiveDict();
});

Template.home.events({
  'click .btn'(event,instance){
    event.preventDefault();

    Meteor.call('resources.clearAll',function(error){
    if (error) {
      console.log('清空数据库失败'+error);
    }
    console.log('清空数据库成功');
    });

    Meteor.call('resources.add',function(error,instance){
      if (error) {
        instance.error.set('error',error);
        console.log(error);
      } else{
        // 后端错误无法显示
        console.log('获取全部内容成功');
        FlowRouter.go('/main');
      }
    });
  }
})
