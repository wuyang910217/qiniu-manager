import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Resources } from './resources.js';

Meteor.publish('contents',function(){
  return Resources.find({},{fields: {contents: 1},limit: 50});
});

Meteor.publish('detail',function(id){
  return Resources.find({_id: id},{fields: {bucket: 1, hostname: 1, contents: 1}});
});



