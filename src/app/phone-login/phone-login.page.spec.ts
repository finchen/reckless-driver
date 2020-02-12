import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneLoginPage } from './phone-login.page';

describe('PhoneLoginPage', () => {
  let component: PhoneLoginPage;
  let fixture: ComponentFixture<PhoneLoginPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhoneLoginPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhoneLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
