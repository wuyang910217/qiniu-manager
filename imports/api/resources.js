import { Mongo } from 'meteor/mongo';
import { SimpleSchema, attachSchema } from 'meteor/aldeed:simple-schema';

export const Resources = new Mongo.Collection('resources');

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
