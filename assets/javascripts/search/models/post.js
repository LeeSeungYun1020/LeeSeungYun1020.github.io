class $48b8c888ecab8631$export$2e2bcd8739ae039 {
    constructor(title, excerpt, url){
        this.title = title;
        this.excerpt = excerpt;
        this.url = url;
    }
    isMatched(text) {
        const query = text.toLowerCase();
        return this.title.toLowerCase().includes(query) || this.excerpt.toLowerCase().includes(query);
    }
}


export {$48b8c888ecab8631$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=post.js.map
