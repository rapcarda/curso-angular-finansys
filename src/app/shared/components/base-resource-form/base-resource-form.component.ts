import { OnInit, AfterContentChecked, Injector } from '@angular/core';

// Para trabalhar com formulários
import { FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

// Para manipular a rota
import { switchMap } from 'rxjs/operators';

// Para trabalhar com toastr, sem as chaves é para trazer tudo do pacote
import toastr from 'toastr';

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  currentAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[];
  submittingForm = false;

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBiulder: FormBuilder;

  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData: any) => T
  ) {
      this.route = this.injector.get(ActivatedRoute);
      this.router = this.injector.get(Router);
      this.formBiulder = this.injector.get(FormBuilder);
   }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
    this.configureToastr();
  }

  // Este método é chamado assim que estiver tudo carregado na pagina
  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if(this.currentAction === 'new') {
      this.createResource();
    }
    else {
      this.updateResource();
    }
  }

  // PRIVATE METHODS
  protected createResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.create(resource).subscribe(
      res => this.actionsForSuccess(res),
      error => this.actionsForError(error)
    );
  }

  protected updateResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.update(resource)
      .subscribe(
        res => this.actionsForSuccess(res),
        error => this.actionsForError(error)
      );
  }

  protected actionsForSuccess(resource: T) {
    toastr.success('Solicitação processada com sucesso');

    const baseComponentPath: string = this.route.snapshot.parent.url[0].path;
    // O skip é para não salvar no histórico, se clicar em voltar, não vai voltar para o incluir
    this.router.navigateByUrl(baseComponentPath, {skipLocationChange: true}).then(
      () => {
        if (this.currentAction === 'new') {
          this.router.navigate([baseComponentPath, 'new']);
        }
      }
    );
    this.submittingForm = false;
  }

  protected actionsForError(error) {
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

  protected setCurrentAction() {
    // O comando traz a url da rota a partir da rota principal (category), 
    // no url[0] irá trazer o primeiro segmento
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  protected loadResource() {
    if (this.currentAction === 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get('id')))
      )
      .subscribe(
        (resource) => {
          // Para poder usar no html alguma informação da catgoria se quiser
          this.resource = resource;
          // patchValues faz um bind dos valores da categoria, nos campos do formulario
          this.resourceForm.patchValue(resource);
        },
        (error) => alert('Ocorreu um erro no servidor')
      );
    }
  }

  protected setPageTitle() {
    if (this.currentAction === 'new') {
      this.pageTitle = this.creationPageTitle();
    } else {
      this.pageTitle = this.editionPageTitle();
    }
  }

  protected configureToastr() {
    toastr.options.closeButton = true;
    toastr.options.progressBar = true;
    toastr.options.positionClass = 'toast-bottom-left';
    toastr.options.extendedTimeOut = 0;
    toastr.options.timeOut = 2000;
    toastr.options.fadeOut = 250;
    toastr.options.fadeIn = 250;
  }

  protected creationPageTitle(): string {
      return 'Novo';
  }

  protected editionPageTitle(): string {
    return 'Edição';
  }

  // É como se fosse um método de interface, não é implementado aqui, mas obriga
  // que herdar esta classe implementar.
  protected abstract buildResourceForm(): void;

}
