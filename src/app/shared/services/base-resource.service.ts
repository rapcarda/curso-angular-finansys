import { BaseResourceModel } from '../models/base-resource.model';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export abstract class BaseResourceService<T extends BaseResourceModel> {

    protected http: HttpClient;

    // Ultimo parametro esta recebendo uma função
    // função (parametro entrada) => o que será retornado
    constructor(protected apiPath: string, protected injector: Injector,
                protected jsonDataToResourceFn: (jsonData: any) => T){
        this.http = injector.get(HttpClient);
    }

    // METHODS
    getall(): Observable<T[]> {
        return this.http.get(this.apiPath).pipe(
            // Quando dentro do map é passada a função jsonDataToResources, quando chegar dentro desta
            // função, ela utiliza this.jsonDataToResourceFn.
            // Porém, passando apenas como map(this.jsonDataToResources), o this a ser referenciado
            // dentro da jsonDataToResources, já não é mais o this do contexto BaseResourceService
            // e sim o this do contexto do "map", isso causaria erro de não encontrar a função
            // jsonDataToResourceFn no jsonDataToResources
            // Por isso é preciso, nestes casos, indicar quando passar uma função para outra função
            // qual o this a ser "utilizado", isso se faz com o .bind(this)
            map(this.jsonDataToResources.bind(this)),
            catchError(this.handleError)
        );
    }

    getById(id: number): Observable<T> {
        // const url = `$(this.apiPath)/$(id)`; não sei pq não funcionou
        const url = this.apiPath + '/' + id;
        return this.http.get(url).pipe(
            map(this.jsonDataToResource.bind(this)),
            catchError(this.handleError)
        );
    }

    create(resource: T): Observable<T> {
        return this.http.post(this.apiPath, resource).pipe(
            map(this.jsonDataToResource.bind(this)),
            catchError(this.handleError)
        );
    }

    update(resource: T): Observable<T> {
        const url = this.apiPath + '/' + resource.id;
        // retornar a propria categoria, por que o in-memory-db, no put não retorna nada,
        // por isso força o retorno. Mas se for um servidor real, será devolvido o objeto novo
        return this.http.put(url, resource).pipe(
            map(() => resource,
            catchError(this.handleError))
        );
    }

    delete(id: number): Observable<any> {
        const url = this.apiPath + '/' + id;
        return this.http.delete(url).pipe(
            map(() => null,
            catchError(this.handleError))
        );
    }

    // PROTECTED METHODS
    protected handleError(error: any): Observable<any> {
        console.log('ERRO NA REQUISIÇÃO => ', error);
        return throwError(error);
    }

    protected jsonDataToResource(jsonData: any): T {
        return this.jsonDataToResourceFn(jsonData);
    }

    protected jsonDataToResources(jsonData: any[]): T[] {
        const resources: T[] = [];
        jsonData.forEach(el => resources.push(this.jsonDataToResourceFn(el)));
        return resources;
    }
}
