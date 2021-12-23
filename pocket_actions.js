const https = require('https');
const helpers = require("./helpers.js")
function getUntaggedItems(callback) {
  
  const options = {
    hostname: process.env.base_url,
    path: `/${process.env.api_version}/get/?consumer_key=${process.env.consumer_key}&access_token=${process.env.access_token}&tag=_untagged_&detailType=complete`
  };

  https.get(options, (resp) => {
    let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    callback(JSON.parse(data).list)
  });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

}

function tagItems(pocket_items, tagCallback, nothingCallback) {
  let actions = []
  
  Object.keys(pocket_items).forEach((key) => {
    var tag = ""
    var time_to_read =  5 * Math.round((pocket_items[key].word_count/process.env.words_per_minute)/5)
      
    if (time_to_read != 0) {
      if (time_to_read < 15) {
        time_to_read = "short_reads"
      }
        
      tag = helpers.generateTag(key, time_to_read)
    }
      
    if (pocket_items[key].has_video == "2") {
      var video_length = (pocket_items[key].videos['1'].length)
      
      switch(true) {
        case (video_length > 1800):
          tag = helpers.generateTag(key, "video,long")
          break;
        case (video_length > 900):
          tag = helpers.generateTag(key, "video,medium")
          break;
        case (video_length <= 900):
          tag = helpers.generateTag(key, "video,short")
          break
        default:
          tag = helpers.generateTag(key, "video")
          break
      }
    }
    
    if (tag == "") {
      tag = helpers.generateTag(key, "untaggable")
    }
    
    actions.push(tag)
  })
    
  if (actions.length > 0) {
    var string_actions = JSON.stringify(actions)
    
    const options = {
      hostname: process.env.base_url,
      path: `/${process.env.api_version}/send/?consumer_key=${process.env.consumer_key}&access_token=${process.env.access_token}&actions=${string_actions}`,
      method: 'POST'
    };
  
    const req = https.request(options, (res) => {

      res.on('data', (d) => {
        process.stdout.write(d);
      });
      
      res.on('end', () => {
        tagCallback(pocket_items, actions)
      })
    });
    
    req.on('error', (e) => {
      console.error(e);
    });
    
    req.end();
  } else {
    nothingCallback()
  }
}

module.exports = { getUntaggedItems, tagItems };
