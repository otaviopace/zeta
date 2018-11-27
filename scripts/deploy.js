// Description:
//   Script for managing buckets and policies on AWS S3
//
// Dependencies:
//   "ramda": "0.25.0"
//   "axios": "0.16.2"
//   "bluebird": "3.5.1"
//   "aws-sdk": "2.181.0"
//
// Configuration:
//   HUBOT_AWS_REGION
//   HUBOT_AWS_ACCESS_KEY_ID
//   HUBOT_AWS_SECRET_ACCESS_KEY
//
// Commands:
//   hubot s3 buckets - Get a list of all buckets on AWS S3
//   hubot s3 create bucket <bucket-name> <is-private> - Create a new bucket on AWS S3
//   hubot s3 enable website for bucket <bucket-name> - Enable static website mode for a bucket on AWS S3
//   hubot s3 set policy for bucket <bucket-name> - Set website policy for a bucket on AWS S3
//   hubot s3 get url for bucket <bucket-name> - Get the url of a bucket website on AWS S3
//
// Author:
//   chris@hashlab.com.br

const Promise = require("bluebird");
const CheckPermission = require("../helpers/check-permission");
const GitHubHelper = require("../helpers/github");

Promise.config({
  cancellation: true
});

module.exports = function deployScript(robot) {
  robot.respond(/deploy (.*):(.*) to production/i, res => {
    const repository = res.match[1];
    const commit = res.match[2];

    const deployPromise = Promise.resolve()
      .tap(checkUserPermission)
      .then(checkRepository)
      .then(checkCommit);

    function checkUserPermission() {
      return Promise.resolve()
        .then(CheckPermission(robot, res))
        .tap(hasPermission => {
          if (!hasPermission) {
            return deployPromise.cancel();
          }
          return null;
        });
    }

    function checkRepository() {
      return GitHubHelper.checkRepository(robot, res, repository);
    }

    function checkCommit() {
      return GitHubHelper.checkCommit(robot, res, repository, commit);
    }

    return deployPromise;
  });
};
