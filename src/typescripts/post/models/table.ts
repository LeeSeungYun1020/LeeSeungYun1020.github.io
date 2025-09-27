import {Content} from "./content";

export class Table {
  constructor(private _contents: Array<Content> = Array<Content>()) {
  }

  get contents(): ReadonlyArray<Content> {
    return this._contents
  }

  addContents(contents: Array<Content>) {
    this._contents.push(...contents)
    this._contents.sort((a, b) => a.height - b.height)
  }
}