import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-filters-form',
  templateUrl: './filters-form.component.html',
  styleUrls: ['./filters-form.component.scss'],
})
export class FiltersFormComponent implements OnInit {
  @Input() filtersForm!: FormGroup;
  @Output() resetFiltersForm = new EventEmitter<boolean>();

  constructor() {}

  reset() {
    this.resetFiltersForm.emit(true);
  }

  ngOnInit(): void {}
}
