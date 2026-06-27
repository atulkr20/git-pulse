import { CommitInfo, RepoStats } from "./types";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function calculateStats(repoName: string, commits: CommitInfo[]): RepoStats {
    if ( commits.length === 0) {
        return {
            repoName,
            totalCommits: 0,
            commitsThisWeek: 0,
            commitsThisMonth: 0,
            lastCommitDate: null,
            longestGapDays: 0,
        };
    }

    const sortedDates = commits
    .map((c) => new Date(c.date).getTime())
    .sort((a, b) => a - b);

    const now = Date.now();
    const oneWeekAgo = now - 7 * ONE_DAY_MS;
    const oneMonthAgo = now - 30 * ONE_DAY_MS;

    const commitsThisWeek = sortedDates.filter((d) => d >= oneWeekAgo).length;
    const commitsThisMonth = sortedDates.filter((d) => d >= oneMonthAgo).length;

    let longestGapMs = 0;
    for (let i = 1; i < sortedDates.length; i++) {
        const gap = sortedDates[i] - sortedDates[i - 1];
        if (gap > longestGapMs) {
            longestGapMs = gap;
        }

    }

    const lastCommitDate = new Date(sortedDates[sortedDates.length - 1]).toISOString();

    return {
        repoName,
        totalCommits: commits.length,
        commitsThisWeek,
        commitsThisMonth,
        lastCommitDate,
        longestGapDays: Math.round(longestGapMs / ONE_DAY_MS),
    };

}