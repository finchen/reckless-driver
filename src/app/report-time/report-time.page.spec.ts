import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTimePage } from './report-time.page';

describe('ReportTimePage', () => {
  let component: ReportTimePage;
  let fixture: ComponentFixture<ReportTimePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportTimePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportTimePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
