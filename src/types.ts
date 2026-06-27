export interface CommitInfo {
    sha: string;
    message: string;
    date: string
}

export interface RepoStats {
    repoName: string;
    totalCommits: number;
    commitsThisWeek: number;
    commitsThisMonth: number;
    lastCommitDate: string | null;
    longestGapDays: number;
    error?: string
}


export interface RepoConfig {
    username: string;
    repos: string[];
}

