import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThanksQuickPage } from './thanks-quick.page';

describe('ThanksQuickPage', () => {
  let component: ThanksQuickPage;
  let fixture: ComponentFixture<ThanksQuickPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThanksQuickPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThanksQuickPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
