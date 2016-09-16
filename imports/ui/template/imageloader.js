import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import { BUCKET } from '../../api/conf.js';

import './imageloader.html';

Template.imageloader.events({
  'click .upload'(event,instance){
    event.preventDefault();

    let ofile = $('input[name=file]')[0].files;
    let file = $('input[name=file]')[0].files[0];
    let fileName = $('input[name=file]')[0].files[0].name;
    let bucket = $('input[name=bucket]').val();
    let path = $('input[name=path]').val();
    console.log(bucket);

    if (ofile.length === 0) {
      alert('请选择文件');
    }
    if (bucket == '') {
      bucket = BUCKET;
    }

    if (path != '') {
      fileName = path+'/'+fileName;
    }
    console.log(fileName);

    let reader = new FileReader();
    reader.onload = function(){

      let buffer = reader.result;
      // console.log(buffer);

      Meteor.call('resources.upload',bucket,fileName,buffer,function(err){
      if (err) {
        console.log('resources.upload---error'+ err);
        }else{
          console.log('resources.upload-----success');
        }
      });
    };
    reader.readAsDataURL(file);
    // reader.readAsBinaryString(file);
  },
});
