module.exports = paginate

const method = require('./method')

function paginate (octokit, endpointDefaults, endpointParams, options) {
  return {
    [Symbol.asyncIterator]: () => {
      return getIteratorFor({
        octokit,
        endpointDefaults,
        endpointParams,
        options
      })
    }
  }
}

function getIteratorFor (context) {
  const octokit = context.octokit
  const state = {
    page: context.options.page
  }

  return {
    next () {
      state.page = (state.page || 0) + 1

      if (state.done) {
        return Promise.resolve({ done: true })
      }

      return method(octokit, context.endpointDefaults, context.endpointParams, Object.assign(context.options, { page: state.page }))

        .then((result) => {
          if (!octokit.hasNextPage(result)) {
            state.done = true
          }

          return {
            value: result
          }
        })
    }
  }
}
