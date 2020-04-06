import { InMemoryDbService } from "angular-in-memory-web-api";

export class InMemoryDatanase implements InMemoryDbService {
    createDb(){
        const categories =[
            { id: 1, name: 'Moradia', descricao: 'Pagamentos de Contas da Casa' },
            { id: 2, name: 'Saúde', descricao: 'Plano de Saúde' },
            { id: 3, name: 'Lazer', descricao: 'Cinema, parque, praia, etc' },
            { id: 4, name: 'Salário', descricao: 'Recebimento Salário' },
            { id: 5, name: 'Freelas', descricao: 'Trabalhos como freelancer' }
        ];

        return { categories };
    }
}
