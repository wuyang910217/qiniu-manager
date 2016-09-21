import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ResourcesIndex } from '../../api/resources.js';
import './searchbox.html';

Template.searchBox.helpers({
  resourcesIndex() {
    return ResourcesIndex;
  },
  inputAttribute() {
    return {
      placeholder: 'input key name',
      type: 'string'
    };
  }
});
