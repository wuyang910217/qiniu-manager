import { Meteor } from 'meteor/meteor';

// bucket name
export const BUCKET = Meteor.settings.public.BUCKET;

// export const KEY = 'test.png';
//
// ak sk
export const ACCESS_KEY = Meteor.settings.public.ACCESS_KEY;
export const SECRET_KEY = Meteor.settings.public.SECRET_KEY;


export const PIC_STYLE = Meteor.settings.public.PIC_STYLE;
export const HOST_NAME = Meteor.settings.public.HOST_NAME;

// URL -> HOST_NAME+'/'+KEY+'?'+PIC_STYLE


