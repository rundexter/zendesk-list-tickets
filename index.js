var util = require('./util.js'),
    zendesk = require('node-zendesk');

var pickOutputs = {
        id: { key: 'data', fields: ['id'] },
        requester_id: { key: 'data', fields: ['requester_id'] },
        assignee_id: { key: 'data', fields: ['assignee_id'] },
        collaborator_ids: { key: 'data', fields: ['collaborator_ids'] },
        created_at: { key: 'data', fields: ['created_at'] },
        subject: { key: 'data', fields: ['subject'] },
        description: { key: 'data', fields: ['description'] },
        status: { key: 'data', fields: ['status'] }
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var token = dexter.environment('zendesk_token'),
            username = dexter.environment('zendesk_username'),
            subdomain = dexter.environment('zendesk_subdomain');

        if (!token || !username || !subdomain)
            return this.fail('A [zendesk_token,zendesk_username,zendesk_subdomain] environment variable is required for this module');
        
        var client = zendesk.createClient({
            username:  username,
            token:     token,
            remoteUri: 'https://' + subdomain + '.zendesk.com/api/v2'
        });
        client.tickets.list(function (err, req, result) {
            if (err)
                this.fail(err);
            else
                this.complete(util.pickOutputs({ data: result }, pickOutputs));
        }.bind(this));
    }
};
