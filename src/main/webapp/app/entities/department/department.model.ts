import { IAddress } from 'app/entities/address/address.model';

export interface IDepartment {
  id: number;
  departmentName?: string | null;
  address?: Pick<IAddress, 'id'> | null;
}

export type NewDepartment = Omit<IDepartment, 'id'> & { id: null };
