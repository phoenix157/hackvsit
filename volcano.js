const request= require('request');
const fs=require('fs');

var _volcano = function(country){
request({
  url: 'http://hisz.rsoe.hu/alertmap/database/mapData/volcano.json',
  json:true
},
(error,response,body)=>
{
  //console.log(body.data);
  var a=body.data;
fs.writeFileSync('volcano-data.json',JSON.stringify(a));
});

var string= fs.readFileSync('volcano-data.json',"utf8");
string=JSON.parse(string);
//console.log(string);
var scraped= new Array();
var city;
for(var i=0;i<string.length;i++)
{
  var k=string[i].location;
  //console.log(k.includes(country));
  if(k.includes(country))
  {
    console.log(string[i]);
    console.log(string[i].location.indexOf(','));
    if(string[i].location.indexOf(',')===-1)
    {
    city = string[i].location;}
    else{
    city = string[i].location.substr(0,string[i].location.indexOf(','));}
    console.log(city);
    request({
      url: 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins='+city+'&destinations=New+Delhi,India&key=AIzaSyBuqfb1SmEXrwj3GV8f3T8mvQtOiZsdZE4',
      json:true
    },
    (error,response,body)=>
    {
      if(body.rows[0].elements[0].distance.value<200000)
      {scraped.push(string[i]);
      console.log('pushed');}
  })
  }
}

fs.writeFileSync('volcano-scraped.json',JSON.stringify(scraped));};

module.exports=
{
  _volcano
};
