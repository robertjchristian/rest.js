'use strict'

module.exports = apiPlugin

const method = require('./method')

const ENDPOINT_DEFAULTS = require('../../routes.json')

function apiPlugin (octokit) {
  Object.keys(ENDPOINT_DEFAULTS).forEach(namespaceName => {
    octokit[namespaceName] = {}

    Object.keys(ENDPOINT_DEFAULTS[namespaceName]).forEach(apiName => {
      let apiOptions = ENDPOINT_DEFAULTS[namespaceName][apiName]
      let deprecated

      if (apiOptions.alias) {
        deprecated = apiOptions.deprecated
        const [aliasNamespaceName, aliasApiName] = apiOptions.alias.split('.')
        apiOptions = ENDPOINT_DEFAULTS[aliasNamespaceName][aliasApiName]
      }

      const endpointDefaults = ['method', 'url', 'headers'].reduce((map, key) => {
        if (typeof apiOptions[key] !== 'undefined') {
          map[key] = apiOptions[key]
        }

        return map
      }, {})

      if (deprecated) {
        endpointDefaults.deprecated = deprecated
      }

      octokit[namespaceName][apiName] = method.bind(null, octokit, endpointDefaults, apiOptions.params)

      // I want each endpoint method to be `@octokit/request`
      // with defaults set to endpointDefaults so we can
      // client.repos.createComment(options)
      // client.repos.createComment.defaults(options)
      // client.repos.createComment.endpoint(options)
      // client.repos.createComment.endpoint.DEFAULTS
      // But I don’t know how to add hooks or validation 🤔
    })
  })
}
