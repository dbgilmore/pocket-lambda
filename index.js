const pocket = require('./pocket_actions')
const sns = require('./sns_actions')

exports.handler = (event, context) => {
  pocket.getUntaggedItems(function(response) {
    pocket.tagItems(response, function(response, tags) {
      sns.publishSuccess(response, tags)
    }, 
    function() {
      sns.publishNothingToTag()
    })
  })
};

