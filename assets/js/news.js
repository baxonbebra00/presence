(() => {
  const stories = Array.isArray(window.PRESENCE_NEWS) ? window.PRESENCE_NEWS : null;
  const grid = document.getElementById("news-grid");
  const empty = document.getElementById("news-empty");
  const filters = Array.from(document.querySelectorAll("[data-news-filter]"));
  const categories = new Set(["all", "crypto", "technology", "companies"]);

  if (!stories || !stories.length || !grid || !empty || !filters.length) return;

  const categoryLabel = (category) => ({
    crypto: "Crypto",
    technology: "Technology",
    companies: "Companies"
  })[category] || category;

  const appendText = (parent, tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value;
    parent.append(element);
    return element;
  };

  const safeReadingTime = (value) => {
    if (typeof value !== "string" || value.length > 32 || value !== value.trim()) return null;
    const match = /^([1-9]\d*) min read$/.exec(value);
    return match && Number.isSafeInteger(Number(match[1])) ? value : null;
  };

  const makeCard = (story) => {
    const article = document.createElement("article");
    article.className = `news-card news-card--${story.category}`;

    const meta = document.createElement("div");
    meta.className = "news-card__meta";
    appendText(meta, "span", "news-card__category", categoryLabel(story.category));
    appendText(meta, "span", "news-card__type", story.type);
    article.append(meta);

    const heading = document.createElement("h2");
    const link = document.createElement("a");
    link.href = story.url;
    link.textContent = story.title;
    heading.append(link);
    article.append(heading);

    appendText(article, "p", "news-card__summary", story.summary);

    const foot = document.createElement("div");
    foot.className = "news-card__foot";
    appendText(foot, "span", "", story.author);
    const readingTime = safeReadingTime(story.readingTime);
    if (readingTime) appendText(foot, "span", "", readingTime);
    article.append(foot);

    return article;
  };

  const updateCounts = () => {
    document.querySelectorAll("[data-news-count]").forEach((node) => {
      const category = node.dataset.newsCount;
      node.textContent = String(category === "all"
        ? stories.length
        : stories.filter((story) => story.category === category).length);
    });
  };

  const render = (requestedCategory) => {
    const category = categories.has(requestedCategory) ? requestedCategory : "all";
    const visibleStories = category === "all"
      ? stories
      : stories.filter((story) => story.category === category);

    grid.replaceChildren(...visibleStories.map(makeCard));
    empty.hidden = visibleStories.length > 0;

    filters.forEach((button) => {
      const active = button.dataset.newsFilter === category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  const categoryFromHash = () => window.location.hash.slice(1).toLowerCase() || "all";

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.newsFilter;
      window.history.replaceState(null, "", category === "all" ? "#all" : `#${category}`);
      render(category);
    });
  });

  window.addEventListener("hashchange", () => render(categoryFromHash()));
  updateCounts();
  render(categoryFromHash());
})();
