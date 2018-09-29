const octokit = require('@octokit/rest')({
  debug: true
})

// get all issues across all pages
async function getAllIssuesForRepo ({ owner, repo }) {
  const results = []
  for await (const result of octokit.issues.getForRepo.paginate({ owner, repo })) {
    results.push(...result.data)
  }
  return results
}

getAllIssuesForRepo({ owner: 'octokit', repo: 'rest.js' })

// find first issue matching a condition
async function findIssue ({ owner, repo, findFn }) {
  const results = []
  for await (const result of octokit.issues.getForRepo.paginate({ owner, repo })) {
    const match = findFn(result.data)
    if (match) {
      return match
    }
    results.push(...result.data)
  }
}

findIssue({
  owner: 'octokit',
  repo: 'rest.js',
  find (issues) {
    return issues.find(issue => /<!-- secret issue marker -->/.test(issue.body))
  }
})

// find all issues and map values
async function mapIssues ({ owner, repo, map }) {
  const results = []
  for await (const result of octokit.issues.getForRepo.paginate({ owner, repo })) {
    results.push(...result.data)
  }
  return results.map(map)
}

mapIssues({
  owner: 'octokit',
  repo: 'rest.js',
  map (issues) {
    return issues.map(issue => ({ title: issue.title }))
  }
})
