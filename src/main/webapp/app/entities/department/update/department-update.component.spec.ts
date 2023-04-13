import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { DepartmentFormService } from './department-form.service';
import { DepartmentService } from '../service/department.service';
import { IDepartment } from '../department.model';
import { IAddress } from 'app/entities/address/address.model';
import { AddressService } from 'app/entities/address/service/address.service';

import { DepartmentUpdateComponent } from './department-update.component';

describe('Department Management Update Component', () => {
  let comp: DepartmentUpdateComponent;
  let fixture: ComponentFixture<DepartmentUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let departmentFormService: DepartmentFormService;
  let departmentService: DepartmentService;
  let addressService: AddressService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [DepartmentUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(DepartmentUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DepartmentUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    departmentFormService = TestBed.inject(DepartmentFormService);
    departmentService = TestBed.inject(DepartmentService);
    addressService = TestBed.inject(AddressService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Address query and add missing value', () => {
      const department: IDepartment = { id: 456 };
      const address: IAddress = { id: 33242 };
      department.address = address;

      const addressCollection: IAddress[] = [{ id: 12312 }];
      jest.spyOn(addressService, 'query').mockReturnValue(of(new HttpResponse({ body: addressCollection })));
      const additionalAddresses = [address];
      const expectedCollection: IAddress[] = [...additionalAddresses, ...addressCollection];
      jest.spyOn(addressService, 'addAddressToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ department });
      comp.ngOnInit();

      expect(addressService.query).toHaveBeenCalled();
      expect(addressService.addAddressToCollectionIfMissing).toHaveBeenCalledWith(
        addressCollection,
        ...additionalAddresses.map(expect.objectContaining)
      );
      expect(comp.addressesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const department: IDepartment = { id: 456 };
      const address: IAddress = { id: 91745 };
      department.address = address;

      activatedRoute.data = of({ department });
      comp.ngOnInit();

      expect(comp.addressesSharedCollection).toContain(address);
      expect(comp.department).toEqual(department);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDepartment>>();
      const department = { id: 123 };
      jest.spyOn(departmentFormService, 'getDepartment').mockReturnValue(department);
      jest.spyOn(departmentService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ department });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: department }));
      saveSubject.complete();

      // THEN
      expect(departmentFormService.getDepartment).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(departmentService.update).toHaveBeenCalledWith(expect.objectContaining(department));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDepartment>>();
      const department = { id: 123 };
      jest.spyOn(departmentFormService, 'getDepartment').mockReturnValue({ id: null });
      jest.spyOn(departmentService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ department: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: department }));
      saveSubject.complete();

      // THEN
      expect(departmentFormService.getDepartment).toHaveBeenCalled();
      expect(departmentService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDepartment>>();
      const department = { id: 123 };
      jest.spyOn(departmentService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ department });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(departmentService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareAddress', () => {
      it('Should forward to addressService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(addressService, 'compareAddress');
        comp.compareAddress(entity, entity2);
        expect(addressService.compareAddress).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
