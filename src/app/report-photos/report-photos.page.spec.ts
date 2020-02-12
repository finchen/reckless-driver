import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPhotosPage } from './report-photos.page';

describe('ReportPhotosPage', () => {
  let component: ReportPhotosPage;
  let fixture: ComponentFixture<ReportPhotosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportPhotosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportPhotosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
