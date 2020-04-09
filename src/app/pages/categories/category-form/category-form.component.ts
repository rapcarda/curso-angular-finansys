import { Component, Injector } from '@angular/core';
import { BaseResourceFormComponent } from '../../../shared/components/base-resource-form/base-resource-form.component';

// Para trabalhar com formulários
import { Validators } from '@angular/forms';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent extends BaseResourceFormComponent<Category> {

  constructor(
    protected categoryService: CategoryService,
    protected injector: Injector
  ) {
    super(injector, new Category(), categoryService, Category.fromJson);
  }

  // PRIVATE METHODS
  protected buildResourceForm() {
    this.resourceForm = this.formBiulder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(1000)]]
    });
  }

  protected creationPageTitle(): string {
    return 'Cadastro de nova Categoria';
  }

  protected editionPageTitle(): string {
    const categoryName = this.resource.name || '';
    return 'Editando categoria: ' + categoryName;
  }
}
