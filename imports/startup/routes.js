import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../ui/not-found.html';

FlowRouter.route('/', {
  name: 'home',
  action: function(){
    BlazeLayout.render('home');
  }
});

FlowRouter.route('/main',{
  name: 'main',
  action: function(){
    BlazeLayout.render('mainLayout', {main: 'main'});
  },
  subscriptions: function(params){
    this.register('mainpage',Meteor.subscribe('contents'));
  },
});

FlowRouter.route('/imageloader',{
  name: 'imageloader',
  action: function(){
    BlazeLayout.render('mainLayout', {main: 'imageloader'});
  }
});

FlowRouter.route('/query',{
  name: 'query',
  action: function(){
    BlazeLayout.render('mainLayout', {main: 'query'});
  }
});

FlowRouter.route('/detail/:queryId',{
  name: 'detail',
  // subscriptions: function(params){
  //   this.register('detail-content',Meteor.subscribe('detail',params.queryId));
  // },
  action: function(){
    BlazeLayout.render('mainLayout', {main: 'detail'});
  }
});

FlowRouter.notFound = {
  action: function(){
    BlazeLayout.render('notFound');
  }
}
