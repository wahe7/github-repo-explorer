import { useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import ProfileCard from './components/ProfileCard.jsx';
import RepoList from './components/RepoList.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import LoadingSkeleton from './components/LoadingSkeleton.jsx';
import RecentSearches from './components/RecentSearches.jsx';
import { useGitHubUser } from './hooks/useGitHubUser.js';
import { useRecentSearches } from './hooks/useRecentSearches.js';
import './App.css';

function App() {
  const {
    profile,
    repos,
    page,
    totalPages,
    sort,
    order,
    loading,
    slideDirection,
    error,
    username,
    search,
    changeSort,
    changeOrder,
    goToPage,
    retry,
  } = useGitHubUser();

  const { getRecent, addRecent } = useRecentSearches();
  const [recentSearches, setRecentSearches] = useState(getRecent);

  function handleSearch(name) {
    search(name);
    setRecentSearches(addRecent(name));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>GitHub Repo Explorer</h1>
        <p className="app-subtitle">
          Search a GitHub username to view their profile and public repositories.
        </p>
        <SearchBar onSearch={handleSearch} disabled={loading} />
      </header>

      <main className="app-main">
        <RecentSearches searches={recentSearches} onSelect={handleSearch} />

        {loading && !profile && <LoadingSkeleton />}

        {error && !loading && <ErrorBanner error={error} onRetry={retry} />}

        {profile && (
          <>
            <ProfileCard profile={profile} />
            <RepoList
              repos={repos}
              username={username}
              publicRepos={profile.publicRepos}
              sort={sort}
              order={order}
              onSortChange={changeSort}
              onOrderChange={changeOrder}
              page={page}
              totalPages={totalPages}
              onPageChange={goToPage}
              slideDirection={slideDirection}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
