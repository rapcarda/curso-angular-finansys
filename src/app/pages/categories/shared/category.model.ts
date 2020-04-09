import { BaseResourceModel } from '../../../shared/models/base-resource.model';

export class Category extends BaseResourceModel {
    constructor(
        public id?: number,
        public name?: string,
        public description?: string
    ){
        // indica que chama o construtor da classe base
        super();
    }

    static fromJson(jsonData: any): Category {
        return Object.assign(new Category(), jsonData);
    }
}
