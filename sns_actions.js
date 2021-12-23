const aws = require('aws-sdk');
aws.config.update({region: 'eu-west-2'});
const helpers = require("./helpers")

function publishSuccess(pocket_items, tags) {
  var number_of_tags = tags.length
  let message = `Here's what was tagged:\n\n`
  
  tags.forEach(tag => {
    message = `${message}${pocket_items[tag.item_id].resolved_title}: ${tag.tags}\n`
    message = `${message}${pocket_items[tag.item_id].resolved_url}\n\n`
  })
  
  publish(message, "Success", number_of_tags)
}

function publishNothingToTag() {
  let message = 'There was nothing to tag.'
  
  publish(message, "Success", 0)
}

function publishFailure(error) {
  publish(error, "Failure")
}

function publish(message, successOrFailure, number_of_tags) {
  
  var params = {
    Subject: `Pocket Tagger ${successOrFailure} - ${helpers.generateDate()} - ${number_of_tags} ${(number_of_tags == 1 ? 'item' : 'items')} tagged`,
    Message: message,
    TopicArn: process.env.sns_topic
  };
  
  var publishTextPromise = new aws.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
  
  publishTextPromise.then(
    function(data) {
      console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
      console.log("MessageID is " + data.MessageId);
  }).catch(
    function(err) {
      console.error(err, err.stack);
  });
}

module.exports = { publishSuccess, publishFailure, publishNothingToTag };
