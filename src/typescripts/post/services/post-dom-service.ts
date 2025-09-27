import {Content} from "../models/content"
import {Table} from "../models/table"

export const service = {
  loadContents,
}

function loadContents(contentsElement: HTMLElement): Table {
  const table = new Table()
  if (contentsElement === null) return table
  table.addContents([
    ...getContentsByTagName(contentsElement, "h1"),
    ...getContentsByTagName(contentsElement, "h2"),
    ...getContentsByTagName(contentsElement, "h3"),
  ])
  return table
}

function getContentsByTagName(
    element: HTMLElement,
    headingElementTagName: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"): Array<Content> {
  return Array.from(element.getElementsByTagName(headingElementTagName), head => {
    return new Content(
        head.id,
        head.innerText,
        Number(head.tagName.slice(-1)),
        head.getBoundingClientRect().top - element.getBoundingClientRect().top + element.scrollTop)
  })
}