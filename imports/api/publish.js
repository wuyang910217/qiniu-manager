import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Resources } from './resources.js';

Meteor.publish('contents',function(){
  return Resources.find({},{fields: {contents: 1},limit: 20});
});

Meteor.publish('detail',function(id){
  return Resources.find({_id: id},{fields: {contents: 1}});
});



