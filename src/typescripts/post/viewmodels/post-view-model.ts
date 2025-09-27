import {BehaviorSubject, map} from 'rxjs'
import {service} from "../services/post-dom-service";
import {Table} from "../models/table";

export class PostViewModel {
  private readonly _table = new BehaviorSubject(new Table())
  readonly table = this._table.asObservable().pipe(
      map(t => new Table(t.contents.filter(c => c.level <= 3))),
  )

  loadContents(contentsElement: HTMLElement) {
    this._table.next(service.loadContents(contentsElement))
  }
}