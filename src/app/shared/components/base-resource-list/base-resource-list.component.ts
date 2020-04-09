import { OnInit } from '@angular/core';
import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

export abstract class BaseResourceListComponent<T extends BaseResourceModel> implements OnInit {

  public resources: T[] = [];

  constructor(protected resourceService: BaseResourceService<T>) { }

  ngOnInit(): void {
    this.resourceService.getall().subscribe(
      res => this.resources = res.sort((a, b) => b.id - a.id),
      error => alert('Erro ao carregar lista')
    );
  }

  deleteResource(resource: T) {
    const mustDelete = confirm('Deseja excluir este item?');

    if (mustDelete) {
      this.resourceService.delete(resource.id).subscribe(
        () => this.resources = this.resources.filter(el => el !== resource),
        () => alert('Erro na exclusão!')
      );
    }
  }

}
