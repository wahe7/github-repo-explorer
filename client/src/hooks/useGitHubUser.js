import { useState, useCallback, useRef } from 'react';
import { fetchUser, fetchRepos, fetchReposStream } from '../api/github.js';

export function useGitHubUser() {
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('updated');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [slideDirection, setSlideDirection] = useState('forward');
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const pagesCache = useRef(new Map());
  const activePage = useRef(1);
  const streamId = useRef(0);

  const showPage = useCallback((pageData) => {
    if (pageData.page !== activePage.current) return;

    setRepos(pageData.repos);
    setPage(pageData.page);
    if (pageData.totalPages != null) {
      setTotalPages(pageData.totalPages);
    }
  }, []);

  const loadReposStream = useCallback(async (name, sortBy, orderBy, { clearRepos = false } = {}) => {
    const id = ++streamId.current;
    pagesCache.current = new Map();
    activePage.current = 1;
    setPage(1);
    setSlideDirection('forward');

    if (clearRepos) {
      setRepos([]);
    }

    try {
      await fetchReposStream(name, { sort: sortBy, order: orderBy }, {
        onPage: (pageData) => {
          if (id !== streamId.current) return;
          pagesCache.current.set(pageData.page, pageData.repos);
          showPage(pageData);
        },
        onDone: ({ totalPages: pagesTotal }) => {
          if (id !== streamId.current) return;
          setTotalPages(pagesTotal);
        },
      });
    } catch (err) {
      if (id !== streamId.current) return;
      throw err;
    }
  }, [showPage]);

  const search = useCallback(
    async (name, sortBy = 'updated', orderBy = 'desc') => {
      const trimmed = name.trim();
      if (!trimmed) return;

      setLoading(true);
      setError(null);
      setProfile(null);
      setRepos([]);
      setPage(1);
      setSort(sortBy);
      setOrder(orderBy);
      setUsername(trimmed);
      activePage.current = 1;

      try {
        const userData = await fetchUser(trimmed);
        setProfile(userData);
        setLoading(false);
        await loadReposStream(trimmed, sortBy, orderBy, { clearRepos: true });
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    },
    [loadReposStream]
  );

  const changeSort = useCallback(
    async (sortBy, orderBy = order) => {
      if (!username) return;

      setError(null);
      setSort(sortBy);
      setOrder(orderBy);
      activePage.current = 1;

      try {
        await loadReposStream(username, sortBy, orderBy);
      } catch (err) {
        setError(err);
      }
    },
    [username, order, loadReposStream]
  );

  const changeOrder = useCallback(
    async (orderBy) => {
      if (!username) return;
      await changeSort(sort, orderBy);
    },
    [username, sort, changeSort]
  );

  const goToPage = useCallback(
    async (targetPage) => {
      if (!username || targetPage === page) return;
      if (targetPage < 1 || targetPage > totalPages) return;

      activePage.current = targetPage;
      setSlideDirection(targetPage > page ? 'forward' : 'back');

      const cached = pagesCache.current.get(targetPage);
      if (cached) {
        setRepos(cached);
        setPage(targetPage);
        return;
      }

      setError(null);

      try {
        const reposData = await fetchRepos(username, { page: targetPage, sort, order });
        pagesCache.current.set(targetPage, reposData.repos);
        setRepos(reposData.repos);
        setPage(targetPage);
        setTotalPages(reposData.totalPages ?? totalPages);
      } catch (err) {
        setError(err);
      }
    },
    [username, page, totalPages, sort, order]
  );

  const retry = useCallback(() => {
    if (username) search(username, sort, order);
  }, [username, sort, order, search]);

  return {
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
  };
}
