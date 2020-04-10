import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Category } from './pages/categories/shared/category.model';
import { Entry } from "./pages/entries/shared/entry.model";

export class InMemoryDatabase implements InMemoryDbService {
    createDb(){
        const categories: Category[] = [
            { id: 1, name: 'Moradia', description: 'Pagamentos de Contas da Casa' },
            { id: 2, name: 'Saúde', description: 'Plano de Saúde' },
            { id: 3, name: 'Lazer', description: 'Cinema, parque, praia, etc' },
            { id: 4, name: 'Salário', description: 'Recebimento Salário' },
            { id: 5, name: 'Freelas', description: 'Trabalhos como freelancer' }
        ];

        const entries: Entry[] = [
            { id: 1, name: 'Gás Cozinha', description: 'Gás de Cozinha', type: 'expense', amount: '70,80', date: '10/01/2020', paid: true, categoryId: categories[0].id, category: categories[0] } as Entry,
            { id: 2, name: 'Salário na empresa X', description: 'Salário empresa X', type: 'revenue', amount: '200', date: '10/01/2020', paid: false, categoryId: categories[3].id, category: categories[3] } as Entry,
            { id: 3, name: 'Energia', description: 'Energia Elétrica', type: 'expense', amount: '150,20', date: '28/01/2020', paid: false, categoryId: categories[2].id, category: categories[2] } as Entry,
            { id: 4, name: 'Freelance', description: 'Freelance', type: 'revenue', amount: '1510', date: '02/01/2020', paid: false, categoryId: categories[4].id, category: categories[4] } as Entry,
        ];

        return { categories, entries };
    }
}
