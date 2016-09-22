import { Mongo } from 'meteor/mongo';
import { EasySearch } from 'meteor/easy:search';
import { SimpleSchema, attachSchema } from 'meteor/aldeed:simple-schema';

export const Resources = new Mongo.Collection('resources');

export const ResourcesIndex = new EasySearch.Index({
  collection: Resources,
  fields: [ 'bucket', 'contents.key' ],
  engine: new EasySearch.Minimongo()
});

const Sechma = {};

Sechma.contents =new SimpleSchema({
  key: {
    type: String
  },
  hash: {
    type: String
  },
  fsize: {
    type: Number
  },
  url: {
    type: String
  },
  mimeType: {
    type: String
  },
  putTime: {
    type: Number
  },
});
Sechma.resources = new SimpleSchema({
  bucket: {
    type: String
  },
  assessKey: {
    type: String
  },
  secretKey: {
    type: String
  },
  hostname: {
    type: String
  },
  contents: {
    type: Sechma.contents
  },
  createdAt: {
    type: Date
  }
});

Resources.attachSchema(Sechma.resources);
