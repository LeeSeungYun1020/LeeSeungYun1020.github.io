export function trimIndent(template) {
    const lines = template.split("\n");
    const minIndent = Math.min(...lines
        .filter(line => line.trim().length > 0)
        .map(line => line.match(/^(\s*)/)[0].length));
    return lines.map(line => line.slice(minIndent)).join("\n").trim();
}
export function dedent(strings, ...values) {
    const fullString = strings
        .map((str, i) => str + (values[i] || ""))
        .join("");
    return trimIndent(fullString);
}
