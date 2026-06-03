function toUserProfile(user) {
  return {
    login: user.login,
    avatarUrl: user.avatar_url,
    name: user.name,
    bio: user.bio,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    htmlUrl: user.html_url,
  };
}

export { toUserProfile };
