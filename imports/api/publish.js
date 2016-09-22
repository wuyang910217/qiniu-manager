import { Meteor } from 'meteor/meteor';
import { Resources } from './resources.js';

Meteor.publish('contents',() => {
  return Resources.find({},{fields: {contents: 1},limit: 100});
});

Meteor.publish('detail',(id) => {
  return Resources.find({_id: id},{fields: {bucket: 1, hostname: 1, contents: 1}});
});

// Meteor.publish('error',function(){
//   return Errors.find({});
// });

