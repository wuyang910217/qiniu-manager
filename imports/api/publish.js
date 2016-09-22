import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Resources } from './resources.js';
import { Errors } from './errors.js';

Meteor.publish('contents',function(){
  return Resources.find({},{fields: {contents: 1},limit: 100});
});

Meteor.publish('detail',function(id){
  return Resources.find({_id: id},{fields: {bucket: 1, hostname: 1, contents: 1}});
});

// Meteor.publish('error',function(){
//   return Errors.find({});
// });

