import { CdkDragEnd } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import axios from 'axios';
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
  @ViewChild('download') link!: ElementRef;
  public context!: CanvasRenderingContext2D;
  imgSrc: string = '';
  imgName: string = '';
  croppedImage: string = '';
  insertingText = false;
  taggingPeople = false;
  filteringImage = false;
  croppingImage = false;
  captionForm: FormGroup;
  taggingForm: FormGroup;
  filtersForm!: FormGroup;
  captions!: FormArray;
  tags!: FormArray;
  tagsCoordinates: IDragPosition[] = [];
  textCoordinates: IDragPosition[] = [];
  base64Canvas: any;

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
      self.base64Canvas = self.myCanvas.nativeElement.toDataURL();
    };
    img.src = URL.createObjectURL(event.target.files[0]);
    this.imgSrc = img.src;
    this.imgName = event.target.files[0].name.split('.')[0];
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

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64 as string;
    console.log(this.croppedImage);
  }

  cropDone() {
    this.croppingImage = false;
    var img = new Image();
    let self = this;
    img.onload = function () {
      self.myCanvas.nativeElement.width = img.width;
      self.myCanvas.nativeElement.height = img.height;
      self.context.drawImage(img, 0, 0);
    };
    img.src = this.croppedImage;
  }

  cropImage() {
    this.croppingImage = !this.croppingImage;
    if (this.croppingImage) {
      this.insertingText = false;
      this.taggingPeople = false;
      this.filteringImage = false;
    }
  }

  addFeature(feature: string) {
    if (this.croppingImage) {
      if (confirm('Are you sure? You will lose your crop.')) {
        this.handleCase(feature);
        this.croppingImage = false;
      }
    } else {
      this.handleCase(feature);
    }
  }

  handleCase(feature: string) {
    switch (feature) {
      case 'text':
        this.insertingText = true;
        break;
      case 'tag':
        this.taggingPeople = true;
        break;
      case 'filter':
        this.filteringImage = true;
    }
  }

  async createImage() {
    const payload = {
      html: `<div id="container">${this.getCaptionsHTML()}${this.getTagsHTML()}<img src="${
        this.base64Canvas
      }"><div/>`,
      css: `img {
        filter: ${this.getFilters()};
        }
      
      .draggableCaption {
        width: 0;
        height: 0;
        position: relative;
        z-index: 999;
      }
      
      .textBox{
        padding: 20px;
        display: inline-flex;
        box-sizing: border-box;
        border-radius: 5px;
        text-align: center;
        position: relative;
        z-index: 9;
        width: max-content;
      }
      
      .pointer {
        width: 0;
        height: 0;
        margin-left: 5px;
      }
      
      .draggableTag {
        width: 0;
        height: 0;
        position: relative;
        z-index: 999;
      }
      
      a {
        background-color: black;
        color: white;
        opacity: 0.5;
        padding: 10px 15px;
        text-decoration: none;
        border-radius: 10px;
        position: fixed;
        cursor: default;
      };`,
    };

    let headers = {
      auth: {
        username: 'b0db88e2-240c-4e82-ab7e-ac3f3293a0c7',
        password: '1e238faa-a7ad-4aa1-a5d5-90b21739782c',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const response = await axios.post(
        'https://hcti.io/v1/image',
        JSON.stringify(payload),
        headers
      );
      console.log((response.data as any).url);
      let downloadSrc = (response.data as any).url;
      this.downloadImage(downloadSrc);
    } catch (error) {
      console.error(error);
    }
  }

  async downloadImage(imageUrl: string) {
    const image = await fetch(imageUrl);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    this.link.nativeElement.href = imageURL;
    this.link.nativeElement.download = this.imgName;
    this.link.nativeElement.click();
  }

  getCaptionsHTML() {
    let captions = this.captionForm.value.captions;
    let draggableCaptions = '';
    for (let i = 0; i < captions.length; i++) {
      draggableCaptions += `<div class="draggableCaption" style="color:${
        captions[i].color
      };transform:rotate(${captions[i].rotation}deg);font-size:${
        captions[i].fontSize
      }px;opacity:${captions[i].opacity};font-family:${
        captions[i].fontFamily
      };top:${this.textCoordinates[i].y}px;left:${
        this.textCoordinates[i].x
      }px"><div class="textBox" style="background:${
        captions[i].background
      };padding:${captions[i].fontSize * 1.15}">${
        captions[i].text
      }</div><div class="pointer" style="border-left:${this.border(
        captions[i].fontSize
      )}px solid transparent;border-right:${this.border(
        captions[i].fontSize
      )}px solid transparent;border-top:${this.border(
        captions[i].fontSize
      )}px solid ${captions[i].background}"></div></div>`;
    }
    return draggableCaptions;
  }

  getTagsHTML() {
    let people = this.taggingForm.value.people;
    let draggableTags = '';
    for (let i = 0; i < people.length; i++) {
      draggableTags += `<div class="draggableTag"><a style="top:${this.tagsCoordinates[i].y}px;left:${this.tagsCoordinates[i].x}px" href="${people[i].profile}">${people[i].profile}</a></div>`;
    }

    return draggableTags;
  }

  ngOnInit() {}
}
