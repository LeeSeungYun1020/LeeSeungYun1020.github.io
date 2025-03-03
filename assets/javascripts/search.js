// noinspection JSUnusedGlobalSymbols
export function init(target) {
    onStart(target);
}
// noinspection JSUnusedGlobalSymbols
export function search(posts, query, target) {
    if (query.length === 0) {
        onStart(target);
    }
    else {
        const result = posts
            .filter(post => post.isMatched(query));
        if (result.length === 0) {
            onResultIsEmpty(query, target);
        }
        else {
            onResult(result.map(post => post.toHtmlString())
                .join("\n"), target);
        }
    }
}
function onStart(target) {
    const element = document.querySelector(target);
    if (element instanceof HTMLElement) {
        element.innerHTML = '<h3>검색을 시작해 보세요.</h3>';
    }
}
function onResultIsEmpty(query, target) {
    const element = document.querySelector(target);
    if (element instanceof HTMLElement) {
        element.innerHTML = `<h3>"${query}"에 대한 검색 결과를 찾을 수 없어요.</h3>`;
    }
}
function onResult(resultHTML, target) {
    const element = document.querySelector(target);
    if (element instanceof HTMLElement) {
        element.innerHTML = resultHTML;
    }
}
