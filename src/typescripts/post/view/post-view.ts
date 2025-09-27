import {fromEvent} from "rxjs";
import {PostViewModel} from "../viewmodels/post-view-model";
import {Table} from "../models/table";
import {Content} from "../models/content";


fromEvent(document, 'DOMContentLoaded').subscribe(() => {
  const contentsElement = document.getElementById('post-contents')
  if (!contentsElement) return
  const tableElement = document.getElementById('post-toc')
  if (!tableElement) return
  const viewModel = new PostViewModel()
  let currentTable = new Table()

  viewModel.loadContents(contentsElement)
  viewModel.table.subscribe({
    next: (table) => {
      currentTable = table
      tableElement.innerHTML = createTableHtml(table)
      indicateLocation(table, contentsElement, tableElement, 'post-toc-item-now')
    },
  })
  contentsElement.addEventListener('scroll', () => {
    indicateLocation(currentTable, contentsElement, tableElement, 'post-toc-item-now')
  })
  fromEvent(window, 'resize').subscribe(() => {
    viewModel.loadContents(contentsElement)
  })
})

function createTableHtml(table: Table): string {
  const contentsHtml = table.contents
  .map((content) => createContentHtml(content))
  .join('\n')
  return `
    <ul class="post-toc-list">
      ${contentsHtml}
    </ul>
  `
}

function createContentHtml(content: Content): string {
  const itemClass = `post-toc-item-h${content.level}`

  return `
    <li class="post-toc-node">
      <a class="post-toc-item ${itemClass}" href="#${content.id}">${content.title}</a>
    </li>
  `
}

function indicateLocation(table: Table, contentsElement: HTMLElement, tableElement: HTMLElement, className: string) {
  Array.from(tableElement.getElementsByClassName(className), prev => prev.classList.remove(className))
  const index = table.contents.findIndex(content => content.height >= contentsElement.scrollTop + 10) - 1
  const items = tableElement.getElementsByClassName("post-toc-item")
  if (!items || items.length == 0) return

  let target: Element
  if (index == -1) {
    // 처음 강조
    target = items[0]
  } else if (index == -2) {
    // 마지막 강조
    target = items[items.length - 1]
  } else {
    // 해당 index 강조
    target = items[index]
  }
  target.classList.add(className)
}
