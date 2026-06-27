import "dotenv/config"; // loads .env into process.env automatically
import fs from "fs";
import path from "path";
import chalk from "chalk";
import Table from "cli-table3";

import { fetchCommits } from "./github";
import { calculateStats } from "./stats";
import { RepoConfig, RepoStats } from "./types";

function loadConfig(): RepoConfig {
  const configPath = path.join(__dirname, "..", "repos.json");
  const raw = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(raw) as RepoConfig;
}

function colorizeGap(days: number): string {
  if (days <= 3) return chalk.green(`${days}d`);
  if (days <= 10) return chalk.yellow(`${days}d`);
  return chalk.red(`${days}d`);
}

function colorizeLastCommit(dateStr: string | null): string {
  if (!dateStr) return chalk.red("never");

  const daysSince = Math.round((Date.now() - new Date(dateStr).getTime()) / (24 * 60 * 60 * 1000));

  if (daysSince <= 3) return chalk.green(`${daysSince}d ago`);
  if (daysSince <= 10) return chalk.yellow(`${daysSince}d ago`);
  return chalk.red(`${daysSince}d ago`);
}

async function getAllStats(config: RepoConfig, token: string): Promise<RepoStats[]> {
  const results: RepoStats[] = [];

  for (const repo of config.repos) {
    try {
      const commits = await fetchCommits(config.username, repo, token);
      results.push(calculateStats(repo, commits));
    } catch (err: any) {
      const message = err.response?.status === 404
        ? "repo not found (check name/spelling)"
        : err.response?.status === 401
        ? "bad token (check .env)"
        : err.message;

      results.push({
        repoName: repo,
        totalCommits: 0,
        commitsThisWeek: 0,
        commitsThisMonth: 0,
        lastCommitDate: null,
        longestGapDays: 0,
        error: message,
      });
    }
  }

  return results;
}

function printTable(allStats: RepoStats[]): void {
  const table = new Table({
    head: ["Repo", "Total", "This Week", "This Month", "Last Commit", "Longest Gap"],
    style: { head: ["cyan"] },
  });

  for (const stat of allStats) {
    if (stat.error) {
      table.push([stat.repoName, chalk.red(stat.error), "-", "-", "-", "-"]);
      continue;
    }

    table.push([
      stat.repoName,
      stat.totalCommits,
      stat.commitsThisWeek,
      stat.commitsThisMonth,
      colorizeLastCommit(stat.lastCommitDate),
      colorizeGap(stat.longestGapDays),
    ]);
  }

  console.log(table.toString());
}

function printSummary(allStats: RepoStats[]): void {
  const validStats = allStats.filter((s) => !s.error);
  const totalCommits = validStats.reduce((sum, s) => sum + s.totalCommits, 0);
  const totalThisWeek = validStats.reduce((sum, s) => sum + s.commitsThisWeek, 0);

  console.log(chalk.bold("\nSummary:"));
  console.log(`Total commits across all repos: ${chalk.cyan(totalCommits)}`);
  console.log(`Commits this week: ${chalk.cyan(totalThisWeek)}`);
}

async function main() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error(chalk.red("GITHUB_TOKEN not found in .env file"));
    process.exit(1);
  }

  const config = loadConfig();

  console.log(chalk.bold(`\nFetching activity for ${config.username}...\n`));

  const allStats = await getAllStats(config, token);

  printTable(allStats);
  printSummary(allStats);
}

main().catch((err) => {
  console.error(chalk.red("Something went wrong:"), err.message);
  process.exit(1);
});