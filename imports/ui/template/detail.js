import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import moment from 'moment';
import { isEmpty } from 'lodash/lang';
import { startsWith } from 'lodash/string';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Resources } from '../../api/resources.js';
import './detail.html';

Template.detail.onCreated(function() {
  const self = this;
  self.content = new ReactiveDict();
  self.error = new ReactiveDict();
  self.success = new ReactiveDict();
  const queryId = FlowRouter.getParam('queryId');
  self.subscribe('detail', queryId);
});

Template.detail.helpers({
  error() {
    const instance = Template.instance();
    const error = instance.error.get('error');
    if (!isEmpty(error)) {
      $('.err').show();
      $('.err').fadeOut(5000);
      return error;
    }
    // let error = Errors.findOne({}) || {};
    // console.log(error);
    // if (!isEmpty(error)) {
    //   return error;
    // }
  },
  success(){
    const instance = Template.instance();
    const success = instance.success.get('success');
    if (!isEmpty(success)) {
      $('.success').show();
      $('.success').fadeOut(3000);
      return success;
    }
  },
  // hasError() {
  //   const instance = Template.instance();
  //   const error = instance.error.get('error');
  //   return !isEmpty(error);
  // },
  detail() {
    // 每次运行detail helper 都会执行一次
    const id = FlowRouter.getParam('queryId');
    const detailContent = Resources.findOne({ _id: id }) || {};
    if (isEmpty(detailContent)) {
      // render notFound 页面会闪过layout布局的内容，需要重新定义一个dataNotFound，
      // 作用于layout内部
      // BlazeLayout.render('notFound');
      console.log('empty++++');
      BlazeLayout.render('mainLayout', { main: 'dataNotFound' });
      // 用下面的方法需要定义/404路由，且当前路由变成/404,
      // 而不是localhost:3000/detail/2JM2p8Ngdddddddddddddd
      // FlowRouter.go('/404');
    } else {
      const instance = Template.instance();
      instance.content.set('content-detail', detailContent);
      console.log(instance.content.get('content-detail'));

      console.log('每次运行detail helper 都会执行一次');
      console.log('用{{#let}} {{/let}}包装后，只会执行一次');
      console.log(detailContent, detailContent.contents.mimeType);
      return detailContent;
    }
  },
  size(size) {
    if (size >= 1024 * 1024) {
      const num = size / 1024 / 1024;
      return `${num.toFixed(2)}Mb`;
    }
    const num = size / 1024;
    return `${num.toFixed(2)}kb`;
  },
  date(time) {
    const string = `${time} `;
    const unix = string.slice(0, 10);
    return moment.unix(unix).format('YYYY年MM月DD日');
  },
  isImage(type) {
    return startsWith(type, 'image/');
  },
});

Template.detail.events({
  'click #remove' (event, instance) {
    event.preventDefault();

    instance.error.set('error', '');

    const isCon = confirm('你确定要删除此文件吗？');
    if (!isCon) {
      return;
    }
    const id = FlowRouter.getParam('queryId');
    const bucket = instance.content.get('content-detail').bucket;
    const key = instance.content.get('content-detail').contents.key;

    Meteor.call('resources.remove', id, bucket, key, (err) => {
      if (err) {
        console.log('resources.remove---->');
        console.log(err.reason);
        instance.error.set('error', err.reason);
      } else {
        console.log('resources.remove success');
        FlowRouter.go('/main');
      }
    });
  },
  'click #download' (event, instance) {
    event.preventDefault();

    instance.error.set('error', '');

    const bucket = instance.content.get('content-detail').bucket;
    const key = instance.content.get('content-detail').contents.key;
    const hostname = instance.content.get('content-detail').hostname;

    Meteor.call('resources.download', bucket, key, hostname, (err, ret) => {
      if (err) {
        console.log('resources.download---->');
        console.log(err.reason);
        instance.error.set('error', err.reason);
      } else {
        console.log('resources.download success');
        console.log(ret);
        window.open(ret);
      }
    });
  },
  'click #move' (event, instance) {
    event.preventDefault();

    // 首先要清空，不然只会提示一次，以后都没反应
    instance.error.set('error', '');
    instance.success.set('success', '');

    let newBucket = $('input[name=bucket]').val().trim();
    let newhostname = $('input[name=hostname]').val().trim();
    const newKey = $('input[name=key]').val().trim();

    const bucket = instance.content.get('content-detail').bucket;
    const hostname = instance.content.get('content-detail').hostname;
    const key = instance.content.get('content-detail').contents.key;
    const id = FlowRouter.getParam('queryId');

    if (isEmpty(newBucket)) {
      newBucket = bucket;
    }
    if (isEmpty(newhostname)) {
      newhostname = hostname;
    }
    if (isEmpty(newKey)) {
      alert('必须有新的文件名！');
    } else {
      Meteor.call('resources.move', id, bucket, key, newBucket, newKey, newhostname, (err) => {
        if (err) {
          console.log('resources.move---->error');
          console.log(err.reason);
          instance.error.set('error', err.reason);
        } else {
          instance.success.set('success','操作成功');
          console.log('resources.move success');
        }
      });
    }
  },
  'click #copy' (event, instance) {
    event.preventDefault();

    instance.error.set('error', '');
    instance.success.set('success', '');

    let newBucket = $('input[name=bucket-copy]').val().trim();
    let newhostname = $('input[name=hostname1]').val().trim();
    const newKey = $('input[name=key-copy]').val().trim();

    const bucket = instance.content.get('content-detail').bucket;
    const hostname = instance.content.get('content-detail').hostname;
    const key = instance.content.get('content-detail').contents.key;
    // let id =FlowRouter.getParam('queryId');

    if (isEmpty(newBucket)) {
      newBucket = bucket;
    }
    if (isEmpty(newhostname)) {
      newhostname = hostname;
    }
    if (isEmpty(newKey)) {
      alert('必须有新的文件名！');
    } else {
      Meteor.call('resources.copy', bucket, key, newBucket, newKey, newhostname, (err) => {
        if (err) {
          console.log('resources.copy---->error');
          console.log(err.reason);
          instance.error.set('error', err.reason);
        } else {
          instance.success.set('success','操作成功');
          console.log(instance.success.get('success'));
          console.log('resources.copy success');
        }
      });
    }
  }
});
