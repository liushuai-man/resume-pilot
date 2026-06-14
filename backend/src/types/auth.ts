export interface GithubLoginRequest {
  code: string;
}
export interface GithubLoginResponse {
  code: number;
  data: User;
}

// GitHub API 返回的用户信息格式
export interface GithubUser {
  id: number;
  login: string;
  avatar_url: string;
}

// 数据库用户格式
export interface User {
  id: string;
  github_id: string;
  github_login: string;
  github_avatar: string;
}
