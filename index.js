module.exports = GitHubApi

const Hook = require('before-after-hook')

const parseClientOptions = require('./lib/parse-client-options')
const request = require('@octokit/request')

const PLUGINS = [
  require('./lib/plugins/authentication'),
  require('./lib/plugins/endpoint-methods'),
  require('./lib/plugins/pagination')
]

function GitHubApi (options) {
  const hook = new Hook()
  const api = {
    // NOTE: github.hook and github.plugin are experimental APIs
    //       at this point and can change at any time
    hook,
    plugin: (pluginFunction) => pluginFunction(api),
    request: request.defaults(parseClientOptions(options))
  }

  PLUGINS.forEach(api.plugin)

  return api
}
