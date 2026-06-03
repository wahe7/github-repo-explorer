export default function SearchBar({ onSearch, disabled }) {
  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    onSearch(username);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <label htmlFor="username-input" className="visually-hidden">
        GitHub username
      </label>
      <input
        id="username-input"
        name="username"
        type="text"
        placeholder="Enter a GitHub username…"
        autoComplete="off"
        disabled={disabled}
        required
      />
      <button type="submit" disabled={disabled}>
        Search
      </button>
    </form>
  );
}
