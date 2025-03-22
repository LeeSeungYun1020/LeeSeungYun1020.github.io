function $cd042d46f020e8a2$export$2cd8252107eb640b(target) {
    $cd042d46f020e8a2$var$onStart(target);
}
function $cd042d46f020e8a2$export$d76128d007d19019(posts, query, target) {
    if (query.length === 0) $cd042d46f020e8a2$var$onStart(target);
    else {
        const result = posts.filter((post)=>post.isMatched(query));
        if (result.length === 0) $cd042d46f020e8a2$var$onResultIsEmpty(query, target);
        else $cd042d46f020e8a2$var$onResult(result.map((post)=>post.toHtmlString()).join("\n"), target);
    }
}
function $cd042d46f020e8a2$var$onStart(target) {
    const element = document.querySelector(target);
    if (element instanceof HTMLElement) element.innerHTML = "<h3>\uAC80\uC0C9\uC744 \uC2DC\uC791\uD574 \uBCF4\uC138\uC694.</h3>";
}
function $cd042d46f020e8a2$var$onResultIsEmpty(query, target) {
    const element = document.querySelector(target);
    if (element instanceof HTMLElement) element.innerHTML = `<h3>"${query}"\u{C5D0} \u{B300}\u{D55C} \u{AC80}\u{C0C9} \u{ACB0}\u{ACFC}\u{B97C} \u{CC3E}\u{C744} \u{C218} \u{C5C6}\u{C5B4}\u{C694}.</h3>`;
}
function $cd042d46f020e8a2$var$onResult(resultHTML, target) {
    const element = document.querySelector(target);
    if (element instanceof HTMLElement) element.innerHTML = resultHTML;
}


export {$cd042d46f020e8a2$export$2cd8252107eb640b as init, $cd042d46f020e8a2$export$d76128d007d19019 as search};
//# sourceMappingURL=search.js.map
