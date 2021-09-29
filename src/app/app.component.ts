import { CdkDragEnd } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

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
  taggedPeople: any[] = [];
  captionForm: FormGroup;
  array!: FormArray;

  constructor(private formBuilder: FormBuilder) {
    this.captionForm = this.formBuilder.group({
      array: this.formBuilder.array([this.createText()]),
    });
  }

  createText() {
    return this.formBuilder.group({
      text: '',
      coordinates: { x: 0, y: 0 },
      fontSize: 12,
      color: '#ffffff',
      rotation: 0,
      background: '#000000',
      opacity: 1,
    });
  }

  get fields(): FormArray {
    return this.captionForm.get('array') as FormArray;
  }

  addItem() {
    this.array = this.fields;
    this.array.push(this.createText());
    console.log(this.captionForm.value);
  }

  removeItem(index: number) {
    this.array = this.fields;
    this.array.removeAt(index);
  }

  onDragEnded(event: CdkDragEnd, index: number) {
    this.fields.value[index].coordinates = event.source.getFreeDragPosition();
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

  getCursorPoint(event: any) {
    if (this.taggingPeople) {
      this.taggedPeople[this.taggedPeople.length - 1].x = event.offsetX + 'px';
      this.taggedPeople[this.taggedPeople.length - 1].y = event.offsetY + 'px';
    }
    console.log(this.taggedPeople);
  }

  personChange(event: any) {
    let newPerson = { profile: event.target.value };
    this.taggedPeople.push(newPerson);
  }

  border(fontSize: number) {
    return 12 + (fontSize - 12) / 8 <= 20 ? 12 + (fontSize - 12) / 5 : 20;
  }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');
  }

  ngOnInit() {
    this.captionForm.valueChanges.subscribe((x) => console.log(x));
  }
}
