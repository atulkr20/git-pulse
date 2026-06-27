import axios from 'axios';
import { CommitInfo } from './types';

interface GithubCommitResponse {
    sha: string;
    commit: {
        message: string;
        author: {
            date: string;
        };
    };
}

export async function fetchCommits (
    username: string,
    repo: string,
    token: string
): Promise<CommitInfo[]> {
    const url = `https://api.github.com/repos/${username}/${repo}/commits`;

    const response = await axios.get<GithubCommitResponse[]>(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
        },
        params: {
            per_page: 100,
        },
    });

    return response.data.map((item) => ({
        sha: item.sha,
        message: item.commit.message,
        date: item.commit.author.date,
    }));
}