import { Injectable, Injector } from '@angular/core';
import { BaseResourceService } from 'src/app/shared/services/base-resource.service';
import { Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Entry } from './entry.model';
import { CategoryService } from '../../categories/shared/category.service';

@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry> {

  constructor(protected injector: Injector, private categoryService: CategoryService) {
    // No ultimo parametro esta passando uma função a ser executada, por isso sem o ()
    // quando passa função sem (), ela não é executada
    super('api/entries', injector, Entry.fromJson);
  }

  // METHODS
  create(entry: Entry): Observable<Entry> {
    /* Isso só é necessário pois usa o in-memory, para um server normal, não precisaria */
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(categ => {
        entry.category = categ;

        return super.create(entry);
      })
    );
  }

  update(entry: Entry): Observable<Entry> {
    return this.categoryService.getById(entry.id).pipe(
      flatMap(categ => {
        entry.category = categ;

        // retornar a propria categoria, por que o in-memory-db, no put não retorna nada,
        // por isso força o retorno. Mas se for um servidor real, será devolvido o objeto novo
        return super.update(entry);
      })
    );
  }
}
