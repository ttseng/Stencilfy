var express = require('express');
var fs = require('fs');

var router = express.Router();
var content = fs.readFileSync('.glitch-assets', 'utf8');
var rows = content.split("\n");
var assets = rows.map((row) => {
  try {
    return JSON.parse(row);
  } catch (e) {}
});
assets = assets.filter((asset) => asset);

// Example url
// https://cdn.gomix.com/us-east-1%3A1a0f89c8-26bf-4073-baed-2b409695e959%2Ffoobar.png

router.use((request, response) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Methods", "GET");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  var path = request.path.substring(1);
  
  var [matching] = assets.filter((asset) => {
    if(asset.name)
      return asset.name.replace(/ /g,'%20') === path;
  });
  
  if (!matching || !matching.url) {
    return response.status(404).end("No such file");
  }
  
  return response.redirect(matching.url);
});

module.exports = router;
