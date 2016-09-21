import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import { isEmpty } from 'lodash/lang';
import { BUCKET, HOST_NAME } from '../../api/conf.js';
import { Errors } from '../../api/errors.js';
import './imageloader.html';

Template.imageloader.onCreated(function(){
  this.subscribe('error');
  Meteor.call('errors.clearAll');
});

Template.imageloader.helpers({
  error(){
    let error = Errors.findOne({}) || {};
    console.log(error);
    if (!isEmpty(error)) {
      return error;
    }
  },
  hasError(){
    return Errors.find({}).count() !== 0;
  },
})
Template.imageloader.events({
  'click #upload' (event, instance) {
    event.preventDefault();

    let ofile = $('input[name=file]')[0].files;
    let file = $('input[name=file]')[0].files[0];
    let fileName = $('input[name=file]')[0].files[0].name;
    let bucket = $('input[name=bucket]').val();
    let hostname = $('input[name=hostname]').val();
    let path = $('input[name=path]').val();

    if (ofile.length === 0) {
      alert('请选择文件');
    }
    // bucket and hostname 有对应关系，此处没有检查
    if (bucket == '') {
      bucket = BUCKET;
    }
    if (hostname == '') {
      hostname = HOST_NAME;
    }
    if (path != '') {
      fileName = path + '/' + fileName;
    }
    console.log(bucket, hostname, fileName);

    Meteor.call('errors.clearAll');

    let reader = new FileReader();
    reader.onload = function() {

      let buffer = reader.result;
      // console.log(buffer);
      // let buffer2string = new Buffer(buffer).toString('base64');
      // console.log(buffer2string);

      Meteor.call('resources.upload', bucket, fileName, hostname, buffer, function(err) {
        if (err) {
          console.log('resources.upload---error' + err);
        } else {
          console.log('resources.upload-----success');
        }
      });
    };
    reader.readAsDataURL(file);
    // reader.readAsText(file);
    // reader.readAsBinaryString(file);
  },
});
