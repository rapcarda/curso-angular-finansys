import { Component, OnInit, AfterContentChecked } from '@angular/core';

// Para trabalhar com formulários
import { FormBuilder, FormControl, FormGroup, Validator, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';

// Para manipular a rota
import { switchMap } from 'rxjs/operators';

// Para trabalhar com toastr, sem as chaves é para trazer tudo do pacote
import toastr from 'toastr';
import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit {

  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[];
  submittingForm = false;
  entry: Entry = new Entry();
  categories: Array<Category>;

  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator: '',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ','
  };

  ptBR: any;

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBiulder: FormBuilder,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.ptBR = {
      firstDayOfWeek: 0,
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
      dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
      monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
        'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      today: 'Hoje',
      clear: 'Limpar'
    };

    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
    this.loadCategories();
  }

  // Este método é chamado assim que estiver tudo carregado na pagina
  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction === 'new') {
      this.createEntry();
    }
    else {
      this.updateEntry();
    }
  }

  get typeOptions(): Array<any> {
    return Object.entries(Entry.types).map(
      ([value, text]) => {
        return {
          text: text,
          value: value
        }
      }
    )
  }

  // PRIVATE METHODS
  private createEntry() {
    const entry: Entry = Entry.fromJson(this.entryForm.value);
    this.entryService.create(entry).subscribe(
      entr => this.actionsForSuccess(entr),
      error => this.actionsForError(error)
    );
  }

  private updateEntry() {
    const entry: Entry = Entry.fromJson(this.entryForm.value);

    this.entryService.update(entry)
      .subscribe(
        categor => this.actionsForSuccess(categor),
        error => this.actionsForError(error)
      );
  }

  private actionsForSuccess(entry: Entry) {
    toastr.success('Solicitação processada com sucesso');
    // O skip é para não salvar no histórico, se clicar em voltar, não vai voltar para o incluir
    this.router.navigateByUrl('entries', {skipLocationChange: true}).then(
      () => {
        if (this.currentAction === 'new') {
          this.router.navigate(['entries', 'new']);
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
    // O comando traz a url da rota a partir da rota principal (entry), 
    // no url[0] irá trazer o primeiro segmento
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private buildEntryForm() {
    this.entryForm = this.formBiulder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(1000)]],
      type: ['expense', [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [true, [Validators.required]],
      categoryId: [null, [Validators.required]]
    });
  }

  private loadEntry() {
    if (this.currentAction === 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get('id')))
      )
      .subscribe(
        (entry) => {
          // Para poder usar no html alguma informação da catgoria se quiser
          this.entry = entry;
          // patchValues faz um bind dos valores da categoria, nos campos do formulario
          this.entryForm.patchValue(entry);
        },
        (error) => alert('Ocorreu um erro no servidor')
      );
    }
  }

  private loadCategories() {
    this.categoryService.getall().subscribe(
      categ => this.categories = categ
    );
  }

  private setPageTitle() {
    if(this.currentAction === 'new') {
      this.pageTitle = 'Cadastro de nova lançamento';
    } else {
      const entryName = this.entry.name || '';
      this.pageTitle = 'Editando lançamento: ' + entryName;
    }
  }

}
