import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Resources } from '../../api/resources.js';
import './main.html';

Template.main.helpers({
  isReady(sub) {
    if (sub) {
      return FlowRouter.subsReady(sub);
    }
    return FlowRouter.subsReady();
  },
  contents() {
    console.log('contents helper只执行一次');
    console.log(Resources.find().fetch());
    // 嵌套的时间排序
    return Resources.find({}, { sort: { 'contents.putTime': -1 } });
  }
});

Template.content.helpers({
  isImage(type) {
    return type.indexOf('image/') > -1;
  },
  // 从这里得到id，并存到params里，其他地方都可以调用
  pathForDetail() {
    const params = {
      queryId: this._id
    };
    return FlowRouter.path('detail', params);
  }
});
