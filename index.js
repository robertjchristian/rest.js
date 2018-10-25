module.exports = GitHubApi

const defaultsDeep = require('lodash/defaultsDeep')
const Hook = require('before-after-hook')

const deprecate = require('./lib/deprecate')
const parseClientOptions = require('./lib/parse-client-options')
const request = require('@octokit/request')

const PLUGINS = [
  require('./lib/plugins/authentication'),
  require('./lib/plugins/endpoint-methods'),
  require('./lib/plugins/pagination')
]

function GitHubApi (options) {
  const defaults = defaultsDeep(parseClientOptions(options), request.endpoint.DEFAULTS)

  const hook = new Hook()
  const api = {
    // NOTE: github.hook and github.plugin are experimental APIs
    //       at this point and can change at any time
    hook,
    plugin: (pluginFunction) => pluginFunction(api),
    request: (options) => api.hook('request', defaultsDeep(options, defaults), (options) => {
      if (options.input) {
        options.data = options.input
        delete options.input
        deprecate('options.input – is now options.data')
      }

      return request(options)

        // deprecate response.meta
        .then(response => {
          Object.defineProperty(response, 'meta', {
            get () {
              deprecate('response.meta – use response.headers instead (#896)')
              return response.headers
            }
          })
          return response
        })
    })
  }

  PLUGINS.forEach(api.plugin)

  return api
}
