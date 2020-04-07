import { Component, OnInit } from '@angular/core';
import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {

  public categories: Category[] = [];

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.categoryService.getall().subscribe(
      categories => this.categories = categories,
      error => alert('Erro ao carregar lista')
    );
  }

  deleteCategory(category) {
    const mustDelete = confirm('Deseja excluir esta categoria?');

    if (mustDelete) {
      this.categoryService.delete(category.id).subscribe(
        () => this.categories = this.categories.filter(el => el !== category),
        () => alert('Erro na exclusão de categoria')
      );
    }
  }

}
