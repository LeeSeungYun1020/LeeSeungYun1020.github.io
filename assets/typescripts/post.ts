import {dedent} from "./utils.js";

export default class Post {
	constructor(public title: string, public excerpt: string, public url: string) {

	}

	public isMatched(text: string): boolean {
		const query = text.toLowerCase();
		return this.title.toLowerCase().includes(query) || this.excerpt.toLowerCase().includes(query);
	}

	public toHtmlString(): string {
		return dedent`
      <a href="${this.url}">
        <div class="search-item">
          <h3>${this.title}</h3>
          <div class="search-snippet">${this.excerpt}</div>
        </div>
      </a>`;
	}
}