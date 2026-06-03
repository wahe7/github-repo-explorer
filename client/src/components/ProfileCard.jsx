export default function ProfileCard({ profile }) {
  const displayName = profile.name || profile.login;

  return (
    <section className="profile-card">
      <img
        src={profile.avatarUrl}
        alt={`${displayName}'s avatar`}
        className="profile-avatar"
        width={120}
        height={120}
      />
      <div className="profile-info">
        <h2>
          <a href={profile.htmlUrl} target="_blank" rel="noreferrer">
            {displayName}
          </a>
        </h2>
        <p className="profile-login">@{profile.login}</p>
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        <ul className="profile-stats">
          <li>
            <strong>{profile.followers}</strong> followers
          </li>
          <li>
            <strong>{profile.following}</strong> following
          </li>
          <li>
            <strong>{profile.publicRepos}</strong> repos
          </li>
        </ul>
      </div>
    </section>
  );
}
