import Post from "../models/post";
import {BehaviorSubject} from "rxjs";

export default class SearchViewModel {

	subject = new BehaviorSubject<SearchUiState>({state: 'initial'})

	constructor(private posts: Post[]) {
	}

	search(query: string) {
		if (query.length === 0) {
			this.subject.next({state: 'initial'})
		} else {
			const result = this.posts.filter(post => post.isMatched(query))
			if (result.length === 0) {
				this.subject.next({state: 'empty', query: query})
			} else {
				this.subject.next({state: 'success', results: result})
			}
		}
	}
}

type SearchUiState =
		| { state: 'initial' }
		| { state: 'empty'; query: string }
		| { state: 'success'; results: Post[] };
