var util = require('./util.js'),
    zendesk = require('node-zendesk');

var pickInputs = {
        'subject': { key: 'ticket.subject', validate: { req: true }},
        'comment': 'ticket.comment.body'
    },
    pickOutputs = {
        id: 'id',
        requester_id: 'requester_id',
        assignee_id: 'assignee_id',
        collaborator_ids: 'collaborator_ids',
        created_at: 'created_at',
        subject: 'subject',
        description: 'description',
        status: 'status'
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs),
            token = dexter.environment('zendesk_token'),
            username = dexter.environment('zendesk_username'),
            subdomain = dexter.environment('zendesk_subdomain');

        if (!token || !username || !subdomain)
            return this.fail('A [zendesk_token,zendesk_username,zendesk_subdomain] environment variable is required for this module');

        if (validateErrors)
            return this.fail(validateErrors);
        
        var client = zendesk.createClient({
            username:  username,
            token:     token,
            remoteUri: 'https://' + subdomain + '.zendesk.com/api/v2'
        });

        client.tickets.create(inputs, function (err, req, result) {
            if (err)
                this.fail(err);
            else
                this.complete(util.pickOutputs(result, pickOutputs));
        }.bind(this));
    }
};
