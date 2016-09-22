import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
// import _ from 'lodash';

FlowRouter.route('/', {
  name: 'home',
  action: () => {
    BlazeLayout.render('home');
  }
});

FlowRouter.route('/main',{
  name: 'main',
  action: () => {
    BlazeLayout.render('mainLayout', {main: 'main'});
  },
  subscriptions: function(){
    this.register('mainpage',Meteor.subscribe('contents'));
  },
});

FlowRouter.route('/imageloader',{
  name: 'imageloader',
  action: () => {
    BlazeLayout.render('mainLayout', {main: 'imageloader'});
  }
});

FlowRouter.route('/query',{
  name: 'query',
  action: () => {
    BlazeLayout.render('mainLayout', {main: 'query'});
  }
});

FlowRouter.route('/detail/:queryId',{
  name: 'detail',
  // subscriptions: function(params){
  //   this.register('detail-content',Meteor.subscribe('detail',params.queryId));
  // },
  triggersEnter: [notExist],
  action: () => {
    BlazeLayout.render('mainLayout', {main: 'detail'});
  }
});

function notExist(context){
  const id = context.params.queryId;
  console.log(id);
  // // 不起作用 Resources.find()一直返回空
  // let content = Resources.find({_id: id}) || {};
  // console.log(content.fetch());
  // if (isEmpty(content)) {
  //   BlazeLayout.render('notFound');
  //   stop();
  // }
}

FlowRouter.notFound = {
  action: () => {
    BlazeLayout.render('notFound');
  }
};

// 不用了，直接用BlazeLayout.render('notFound')，它的路由就会保持原样，不会跳转到/404
FlowRouter.route('/404',{
  name: '404',
  action: () => {
    // BlazeLayout.render('notFound');
    // 用下面的，可以显示layout，与notFound的全局样式不同，
    // BlazeLayout.render('mainLayout', {main: 'dataNotFound'});
  }
});
