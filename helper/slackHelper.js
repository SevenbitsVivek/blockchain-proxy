const Slack = require('slack-node');
const config = require('../config');
const rp = require('request-promise');

function SlackHelper() {
    // Initialize the slack object with the webhook URL
    const slack = new Slack();
    slack.setWebhook(config.SLACK_WEB_HOOK);
}

SlackHelper.prototype.senderror = async function(error) {
    const options = {
        method: 'POST',
        uri: config.SLACK_WEB_HOOK, // Use the webhook URL directly
        body: {
            channel: error.channel || config.SLACK_CHANNEL,
            username: error.username || config.SLACK_USERNAME,
            link_names: 1,
            attachments: [{
                link_names: 1,
                color: '#FF5733', // You can choose an appropriate color for errors
                fields: [{
                    title: error.title,
                    value: error.txt,
                    short: false
                }]
            }]
        },
        json: true
    };

    try {
        const response = await rp(options);
        return response;
    } catch (err) {
        throw new Error(`Error sending Slack error message: ${err.message}`);
    }
};

SlackHelper.prototype.sendMessage = async function(message) {
    const options = {
        method: 'POST',
        uri: config.SLACK_WEB_HOOK, // Use the webhook URL directly
        body: {
            channel: message.channel || config.SLACK_CHANNEL,
            username: message.username || config.SLACK_USERNAME,
            link_names: 1,
            attachments: [{
                link_names: 1,
                color: message.color || "#7CD197",
                fields: [{
                    title: message.title,
                    value: message.txt,
                    short: false
                }]
            }]
        },
        json: true
    };

    try {
        const response = await rp(options);
        return response;
    } catch (error) {
        throw new Error(`Error sending Slack message: ${error}`);
    }
};

// Export the SlackHelper class
module.exports = SlackHelper;