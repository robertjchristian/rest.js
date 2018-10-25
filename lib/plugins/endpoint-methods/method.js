module.exports = apiMethod

const isPlainObject = require('is-plain-object')
const merge = require('deepmerge')

const deprecate = require('../../deprecate')
const validate = require('./validate')

function apiMethod (octokit, endpointDefaults, endpointParams, options, callback) {
  // Do not alter passed options, shallow clone is ok (#786)
  options = Object.assign({}, options)

  if (endpointDefaults.deprecated) {
    deprecate(endpointDefaults.deprecated)
    delete endpointDefaults.deprecated
  }

  const endpointOptions = merge(endpointDefaults, options, { isMergeableObject: isPlainObject })

  const promise = Promise.resolve(endpointOptions)
    .then(validate.bind(null, endpointParams))
    .then(octokit.request)

  if (callback) {
    promise.then(callback.bind(null, null), callback)
    return
  }

  return promise
}
