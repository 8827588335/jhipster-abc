import { IDepartment } from 'app/entities/department/department.model';

export interface IEmployee {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  department?: Pick<IDepartment, 'id'> | null;
}

export type NewEmployee = Omit<IEmployee, 'id'> & { id: null };
