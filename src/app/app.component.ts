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
  // taggedPeople: any[] = [];
  captionForm: FormGroup;
  taggingForm: FormGroup;
  captions!: FormArray;
  tags!: FormArray;

  constructor(private formBuilder: FormBuilder) {
    this.captionForm = this.formBuilder.group({
      captions: this.formBuilder.array([this.createText()]),
    });
    this.taggingForm = this.formBuilder.group({
      people: this.formBuilder.array([this.createTag()]),
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

  createTag() {
    return this.formBuilder.group({
      profile: '',
      coordinates: { x: 0, y: 0 },
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
    console.log(this.captionForm.value);
  }

  removeCaption(index: number) {
    this.captions = this.captionFields;
    this.captions.removeAt(index);
  }

  addTag() {
    this.tags = this.tagFields;
    this.tags.push(this.createTag());
  }

  removeTag(index: number) {
    this.tags = this.tagFields;
    this.tags.removeAt(index);
  }

  onDragEnded(event: CdkDragEnd, index: number) {
    this.captionFields.value[index].coordinates =
      event.source.getFreeDragPosition();
  }

  onDragEndedTag(event: CdkDragEnd, index: number) {
    this.tagFields.value[index].coordinates =
      event.source.getFreeDragPosition();
    console.log(this.tagFields.value);
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

  // getCursorPoint(event: any) {
  //   if (this.taggingPeople) {
  //     this.taggedPeople[this.taggedPeople.length - 1].x = event.offsetX + 'px';
  //     this.taggedPeople[this.taggedPeople.length - 1].y = event.offsetY + 'px';
  //   }
  //   console.log(this.taggedPeople);
  // }

  // personChange(event: any) {
  //   let newPerson = { profile: event.target.value };
  //   this.taggedPeople.push(newPerson);
  // }

  border(fontSize: number) {
    return 12 + (fontSize - 12) / 8 <= 20 ? 12 + (fontSize - 12) / 5 : 20;
  }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');
  }

  ngOnInit() {
    this.captionForm.valueChanges.subscribe((x) => console.log(x));
    this.taggingForm.valueChanges.subscribe((x) => console.log(x));
  }
}
