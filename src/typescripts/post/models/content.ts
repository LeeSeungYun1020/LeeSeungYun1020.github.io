export class Content {
  constructor(private _id: string, private _title: string, private _level: number,
      private _height: number) {
  }

  get id() {
    return this._id
  }

  get title() {
    return this._title
  }

  get level() {
    return this._level
  }

  get height() {
    return this._height
  }

  compareTo(other: Content): number {
    return this._height - other._height
  }
}