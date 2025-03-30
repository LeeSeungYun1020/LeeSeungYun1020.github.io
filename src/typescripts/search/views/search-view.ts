import {fromEvent, map} from "rxjs";
import SearchViewModel from "../viewmodels/search-view-model";
import Post from "../models/post";
import {dedent} from "../../utils/utils";

export const posts: Post[] = []

fromEvent(document, 'DOMContentLoaded').subscribe(() => {
	const viewModel = new SearchViewModel(posts)
	const searchBoxElement = document.querySelector('#search_box') as HTMLInputElement
	const targetElement = document.querySelector('.search-result') as HTMLElement

	viewModel.subject.subscribe((uiState) => {
		switch (uiState.state) {
			case "initial":
				targetElement.innerHTML = '<h3>검색을 시작해 보세요.</h3>'
				break
			case "empty":
				targetElement.innerHTML = `<h3>"${uiState.query}"에 대한 검색 결과를 찾을 수 없어요.</h3>`
				break
			case "success":
				targetElement.innerHTML = uiState.results.map((post) => createPostHTML(post)).join('\n')
				break
		}
	})

	if (searchBoxElement.value.length > 0) {
		viewModel.search(searchBoxElement.value)
	}

	fromEvent(searchBoxElement, 'input')
			.pipe(map((event) => (event?.target as HTMLInputElement)?.value ?? ""))
			.subscribe((query) => {
				viewModel.search(query)
			})
});

function createPostHTML(post: Post): string {
	return dedent`
      <a href="${post.url}">
        <div class="search-item">
          <h3>${post.title}</h3>
          <div class="search-snippet">${post.excerpt}</div>
        </div>
      </a>`;
}