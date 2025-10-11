export default class Post {
	constructor(public title: string, public excerpt: string, public url: string) {

	}

	public isMatched(text: string): boolean {
		const query = text.toLowerCase();
		return this.title.toLowerCase().includes(query) || this.excerpt.toLowerCase().includes(query);
	}
}