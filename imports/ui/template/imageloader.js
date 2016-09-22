import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import { isEmpty } from 'lodash/lang';
import { BUCKET, HOST_NAME } from '../../api/conf.js';
import './imageloader.html';

Template.imageloader.onCreated(function(){
  this.error = new ReactiveDict();
  this.success = new ReactiveDict();
});

Template.imageloader.helpers({
  error() {
    const instance = Template.instance();
    const error = instance.error.get('error');
    if (!isEmpty(error)) {
      $('.err').show();
      $('.err').fadeOut(5000);
      return error;
    }
  },
  success() {
    const instance = Template.instance();
    const success = instance.success.get('success');
    if (!isEmpty(success)) {
      $('.success').show();
      $('.success').fadeOut(3000);
      return success;
    }
  },
});

Template.imageloader.events({
  'click #upload' (event, instance) {
    event.preventDefault();

    const ofile = $('input[name=file]')[0].files;
    const file = $('input[name=file]')[0].files[0];
    let fileName = $('input[name=file]')[0].files[0].name;
    let bucket = $('input[name=bucket]').val();
    let hostname = $('input[name=hostname]').val();
    const path = $('input[name=path]').val();

    if (ofile.length === 0) {
      alert('请选择文件');
    }
    // bucket and hostname 有对应关系，此处没有检查
    if (isEmpty(bucket)) {
      bucket = BUCKET;
    }
    if (isEmpty(hostname)) {
      hostname = HOST_NAME;
    }
    if (!isEmpty(path)) {
      fileName = `${path}'/'${fileName}`;
    }
    console.log(bucket, hostname, fileName);

    const reader = new FileReader();
    reader.onload = function() {

      const buffer = reader.result;
      // console.log(buffer);
      // let buffer2string = new Buffer(buffer).toString('base64');
      // console.log(buffer2string);

      Meteor.call('resources.upload', bucket, fileName, hostname, buffer, (err) => {
        if (err) {
          console.log('resources.upload---error');
          console.log(err.reason);
          instance.error.set('error'.error.reason);
        } else {
          instance.success.set('success','操作成功');
          console.log('resources.upload-----success');
        }
      });
    };
    reader.readAsDataURL(file);
    // reader.readAsText(file);
    // reader.readAsBinaryString(file);
  },
});
