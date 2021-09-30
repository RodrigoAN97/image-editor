import { CdkDragEnd } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

interface IDragPosition {
  x: number;
  y: number;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnInit {
  @ViewChild('myCanvas', { static: false }) myCanvas!: ElementRef;
  public context!: CanvasRenderingContext2D;
  imgSrc: string = '';
  insertingText = false;
  taggingPeople = false;
  filteringImage = false;
  captionForm: FormGroup;
  taggingForm: FormGroup;
  filtersForm!: FormGroup;
  captions!: FormArray;
  tags!: FormArray;
  tagsCoordinates: IDragPosition[] = [];
  textCoordinates: IDragPosition[] = [];

  constructor(private formBuilder: FormBuilder) {
    this.captionForm = this.formBuilder.group({
      captions: this.formBuilder.array([this.createText()]),
    });
    this.taggingForm = this.formBuilder.group({
      people: this.formBuilder.array([this.createTag()]),
    });
    this.createFiltersForm();
  }

  createFiltersForm() {
    this.filtersForm = this.formBuilder.group({
      grayscale: 0,
      brightness: 100,
      blur: 0,
      contrast: 100,
      invert: 0,
      opacity: 100,
      sepia: 0,
      saturate: 1,
    });
  }

  createText() {
    this.textCoordinates.push({ x: 0, y: 0 });
    return this.formBuilder.group({
      text: '',
      fontSize: 12,
      fontFamily: 'Calibri',
      color: '#ffffff',
      rotation: 0,
      background: '#000000',
      opacity: 1,
    });
  }

  createTag() {
    this.tagsCoordinates.push({ x: 0, y: 0 });
    return this.formBuilder.group({
      profile: '',
    });
  }

  get captionFields(): FormArray {
    return this.captionForm.get('captions') as FormArray;
  }

  get tagFields(): FormArray {
    return this.taggingForm.get('people') as FormArray;
  }

  addCaption() {
    this.captions = this.captionFields;
    this.captions.push(this.createText());
  }

  removeCaption(index: number) {
    this.captions = this.captionFields;
    this.captions.removeAt(index);
    this.textCoordinates = this.textCoordinates.filter((_, i) => {
      return index !== i;
    });
  }

  addTag() {
    this.tags = this.tagFields;
    this.tags.push(this.createTag());
  }

  removeTag(index: number) {
    this.tags = this.tagFields;
    this.tags.removeAt(index);
    this.tagsCoordinates = this.tagsCoordinates.filter((_, i) => {
      return index !== i;
    });
  }

  onDragEnded(event: CdkDragEnd, index: number) {
    this.textCoordinates[index] = event.source.getFreeDragPosition();
  }

  onDragEndedTag(event: CdkDragEnd, index: number) {
    this.tagsCoordinates[index] = event.source.getFreeDragPosition();
  }

  imageChange(event: any) {
    var img = new Image();
    let self = this;
    img.onload = function () {
      self.myCanvas.nativeElement.width = img.width;
      self.myCanvas.nativeElement.height = img.height;
      self.context.drawImage(img, 0, 0);
    };
    img.src = URL.createObjectURL(event.target.files[0]);
    this.imgSrc = img.src;
  }

  border(fontSize: number) {
    return 12 + (fontSize - 12) / 8 <= 20 ? 12 + (fontSize - 12) / 5 : 20;
  }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');
  }

  getFilters() {
    let filters = this.filtersForm.value;
    return `grayscale(${filters.grayscale}%) brightness(${filters.brightness}%) blur(${filters.blur}px) contrast(${filters.contrast}%) invert(${filters.invert}%) opacity(${filters.opacity}%) sepia(${filters.sepia}%) saturate(${filters.saturate})`;
  }

  ngOnInit() {}
}
