# Git Pulse

A CLI tool that tracks commit activity across multiple GitHub repos in one dashboard. Useful when you're juggling several projects and want a quick view of what's active and what's gone quiet.

## What it does

For each repo listed in your config, Git Pulse fetches commit history from the GitHub API and shows:

- Total commits
- Commits this week / this month
- Last commit date
- Longest gap between two consecutive commits

Output is a color coded table in your terminal — green for recent activity, yellow for getting stale, red for long silence.

## Setup

\`\`\`bash
git clone https://github.com/atulkr20/git-pulse.git
cd git-pulse
npm install
\`\`\`

Create a `.env` file in the root:

\`\`\`
GITHUB_TOKEN=your_github_personal_access_token
\`\`\`

Edit `repos.json` with your GitHub username and the repos you want to track:

\`\`\`json
{
  "username": "your-username",
  "repos": ["repo-one", "repo-two", "repo-three"]
}
\`\`\`

## Usage

\`\`\`bash
npm start
\`\`\`

## Stack

TypeScript, Node.js, GitHub REST API, axios, chalk, cli-table3

## Notes

- Fetches up to 100 commits per repo (no pagination yet, fine for most personal projects).
- If a repo name is wrong or the token is invalid, that row shows an error instead of crashing the whole run.