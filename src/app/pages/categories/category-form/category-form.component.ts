import { Component, OnInit, AfterContentChecked } from '@angular/core';

// Para trabalhar com formulários
import { FormBuilder, FormControl, FormGroup, Validator, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

// Para manipular a rota
import { switchMap } from 'rxjs/operators';

// Para trabalhar com toastr, sem as chaves é para trazer tudo do pacote
import toastr from 'toastr';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {

  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[];
  submittingForm = false;
  category: Category = new Category();
  
  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBiulder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  // Este método é chamado assim que estiver tudo carregado na pagina
  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if(this.currentAction === 'new') {
      this.createCategory();
    }
    else {
      this.updateCategory();
    }
  }

  // PRIVATE METHODS
  private createCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.create(category).subscribe(
      categor => this.actionsForSuccess(categor),
      error => this.actionsForError(error)
    );
  }

  private updateCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);

    this.categoryService.update(category)
      .subscribe(
        categor => this.actionsForSuccess(categor),
        error => this.actionsForError(error)
      );
  }

  private actionsForSuccess(category: Category) {
    toastr.success('Solicitação processada com sucesso');
    // O skip é para não salvar no histórico, se clicar em voltar, não vai voltar para o incluir
    this.router.navigateByUrl('categories', {skipLocationChange: true}).then(
      () => {
        if (this.currentAction === 'new') {
          this.router.navigate(['categories', 'new']);
        }
      }
    );
    this.submittingForm = false;
  }

  private actionsForError(error) {
    toastr.error('Ocorreu um erro ao processar sua solicitação');
    this.submittingForm = false;

    if (error.status === 422){
      // isso vai retornar um array de erros do backend, exemplo
      // ['Nome já existe', 'o email não pode ser nulo']
      this.serverErrorMessages = JSON.parse(error._body).errors;
    }
    else {
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor tente novamente.']
    }
  }

  private setCurrentAction() {
    // O comando traz a url da rota a partir da rota principal (category), 
    // no url[0] irá trazer o primeiro segmento
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private buildCategoryForm() {
    this.categoryForm = this.formBiulder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(1000)]]
    });
  }

  private loadCategory() {
    if (this.currentAction === 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get('id')))
      )
      .subscribe(
        (category) => {
          // Para poder usar no html alguma informação da catgoria se quiser
          this.category = category;
          // patchValues faz um bind dos valores da categoria, nos campos do formulario
          this.categoryForm.patchValue(category);
        },
        (error) => alert('Ocorreu um erro no servidor')
      );
    }
  }

  private setPageTitle() {
    if(this.currentAction === 'new') {
      this.pageTitle = 'Cadastro de nova categoria';
    } else {
      const categoryName = this.category.name || '';
      this.pageTitle = 'Editando categoria: ' + categoryName;
    }
  }

}
