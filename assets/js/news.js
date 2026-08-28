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

  const publicationMonths = Object.freeze([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]);

  const safePublicationDate = (value) => {
    if (typeof value !== "string") return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const yearValue = Number(match[1]);
    const monthValue = Number(match[2]);
    const dayValue = Number(match[3]);
    if (yearValue < 1 || monthValue < 1 || monthValue > 12 || dayValue < 1) return null;

    const leapYear = yearValue % 4 === 0 && (yearValue % 100 !== 0 || yearValue % 400 === 0);
    const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return dayValue <= daysInMonth[monthValue - 1] ? value : null;
  };

  const makePublicationTime = (value) => {
    const date = safePublicationDate(value);
    if (!date) return null;

    const [yearValue, monthValue, dayValue] = date.split("-");
    const time = document.createElement("time");
    time.className = "news-card__date";
    time.dateTime = date;
    time.textContent = `${publicationMonths[Number(monthValue) - 1]} ${Number(dayValue)}, ${yearValue}`;
    return time;
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
    const publicationTime = makePublicationTime(story.date);
    if (publicationTime) meta.append(publicationTime);
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

  const editorialRank = (story) => (
    Number.isSafeInteger(story.featuredRank) && story.featuredRank > 0
      ? story.featuredRank
      : Number.MAX_SAFE_INTEGER
  );

  const orderedStories = [...stories].sort((left, right) => (
    editorialRank(left) - editorialRank(right) ||
    right.date.localeCompare(left.date) ||
    left.url.localeCompare(right.url)
  ));

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
      ? orderedStories
      : orderedStories.filter((story) => story.category === category);

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
