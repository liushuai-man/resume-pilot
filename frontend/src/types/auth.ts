export interface GithubLoginRequest {
  code: string;
}
export interface GithubLoginResponse {
  code: number;
  data: GithubUser;
}
export interface GithubUser {
  id: string;
  github_login: string;
  github_avatar: string;
}

export interface User {
  id: string;
  github_id: string;
  github_login: string;
  github_avatar: string;
}
