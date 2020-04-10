import { Injectable, Injector } from '@angular/core';
import { BaseResourceService } from 'src/app/shared/services/base-resource.service';
import { Observable } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { Entry } from './entry.model';
import { CategoryService } from '../../categories/shared/category.service';
import * as moment from 'moment';

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
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(categ => {
        entry.category = categ;

        // retornar a propria categoria, por que o in-memory-db, no put não retorna nada,
        // por isso força o retorno. Mas se for um servidor real, será devolvido o objeto novo
        return super.update(entry);
      })
    );
  }

  getByMonthAndYear(month: number, year: number): Observable<Entry[]> {
    // Esta maneira é porque tem a base no in-memory, com um servidor real, existiria uma chamada
    // para um serviço que já devolveria os dados filtrados
    return this.getall().pipe(
      map(entries => this.filterByMonthAndYear(entries, month, year))
    );
  }

  private filterByMonthAndYear(entries: Entry[], month: number, year: number) {
    return entries.filter(entry => {
      const entryDate = moment(entry.date, 'DD/MM/YYYY');
      const monthMatches = entryDate.month() + 1 === month;
      const yearhMatches = entryDate.year() === year;

      if (monthMatches && yearhMatches) {
        return entry;
      }
    });
  }
}
