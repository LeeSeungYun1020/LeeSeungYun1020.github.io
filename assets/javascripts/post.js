function $7c1f02f781b86647$export$24703bf258c93379(template) {
    const lines = template.split("\n");
    const minIndent = Math.min(...lines.filter((line)=>line.trim().length > 0).map((line)=>line.match(/^(\s*)/)[0].length));
    return lines.map((line)=>line.slice(minIndent)).join("\n").trim();
}
function $7c1f02f781b86647$export$1d81801f981b61e(strings, ...values) {
    const fullString = strings.map((str, i)=>str + (values[i] || "")).join("");
    return $7c1f02f781b86647$export$24703bf258c93379(fullString);
}


class $ad0c98fce68c3c08$export$2e2bcd8739ae039 {
    constructor(title, excerpt, url){
        this.title = title;
        this.excerpt = excerpt;
        this.url = url;
    }
    isMatched(text) {
        const query = text.toLowerCase();
        return this.title.toLowerCase().includes(query) || this.excerpt.toLowerCase().includes(query);
    }
    toHtmlString() {
        return (0, $7c1f02f781b86647$export$1d81801f981b61e)`
      <a href="${this.url}">
        <div class="search-item">
          <h3>${this.title}</h3>
          <div class="search-snippet">${this.excerpt}</div>
        </div>
      </a>`;
    }
}


export {$ad0c98fce68c3c08$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=post.js.map
