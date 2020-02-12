import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMapPage } from './report-map.page';

describe('ReportMapPage', () => {
  let component: ReportMapPage;
  let fixture: ComponentFixture<ReportMapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportMapPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
