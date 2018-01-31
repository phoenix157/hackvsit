
const request= require('request');
const fs=require('fs');
const short=require('./short');
var country='Indonesia';
short._short(country);
const eq=require('./earthquake');
eq._eq(country);
const tsunami=require('./tsunami');
tsunami._tsunami(country);
const volcano=require('./volcano');
volcano._volcano(country);




////'hello'.includesString.includes('As')//
//console.log(String.includes('As'));
