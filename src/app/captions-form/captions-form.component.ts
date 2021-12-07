import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-captions-form',
  templateUrl: './captions-form.component.html',
  styleUrls: ['./captions-form.component.scss'],
})
export class CaptionsFormComponent implements OnInit {
  @Input() captionForm!: FormGroup;
  @Output() removeCaptionEvent = new EventEmitter<number>();
  @Output() addCaptionEvent = new EventEmitter<boolean>();
  fonts = [
    'Calibri',
    'Arial',
    'Verdana',
    'Helvetica',
    'Tahoma',
    'Trebuchet MS',
    'Times New Roman',
    'Georgia',
    'Garamond',
    'Courier New',
    'Brush Script MT',
  ];

  constructor() {}

  get captionFields(): FormArray {
    return this.captionForm.get('captions') as FormArray;
  }

  removeCaption(index: number) {
    this.removeCaptionEvent.emit(index);
  }

  addCaption() {
    this.addCaptionEvent.emit(true);
  }

  ngOnInit(): void {}
}
