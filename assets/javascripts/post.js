import { dedent } from "./utils.js";
export default class Post {
    constructor(title, excerpt, url) {
        this.title = title;
        this.excerpt = excerpt;
        this.url = url;
    }
    isMatched(text) {
        const query = text.toLowerCase();
        return this.title.toLowerCase().includes(query) || this.excerpt.toLowerCase().includes(query);
    }
    toHtmlString() {
        return dedent `
      <a href="${this.url}">
        <div class="search-item">
          <h3>${this.title}</h3>
          <div class="search-snippet">${this.excerpt}</div>
        </div>
      </a>`;
    }
}
