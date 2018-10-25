module.exports = GitHubApi

const Hook = require('before-after-hook')
const isPlainObject = require('is-plain-object')
const merge = require('deepmerge')

const deprecate = require('./lib/deprecate')
const parseClientOptions = require('./lib/parse-client-options')
const request = require('@octokit/request')

const PLUGINS = [
  require('./lib/plugins/authentication'),
  require('./lib/plugins/endpoint-methods'),
  require('./lib/plugins/pagination')
]

function GitHubApi (options) {
  const { DEFAULTS } = request.endpoint.defaults(parseClientOptions(options))
  const hook = new Hook()
  const api = {
    // NOTE: github.hook and github.plugin are experimental APIs
    //       at this point and can change at any time
    hook,
    plugin: (pluginFunction) => pluginFunction(api),
    request: (options) => {
      if (options.input) {
        options.data = options.input
        delete options.input
        deprecate('options.input – is now options.data')
      }

      options = merge(DEFAULTS, options, { isMergeableObject: isPlainObject })
      return api.hook('request', options, (options) => {
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
  }

  PLUGINS.forEach(api.plugin)

  return api
}
