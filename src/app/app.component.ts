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
import { environment } from 'src/environments/environment';
import { NbToastrService } from '@nebular/theme';
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
  filteringImage = false;
  croppingImage = false;
  captionForm: FormGroup;
  filtersForm!: FormGroup;
  captions!: FormArray;
  textCoordinates: IDragPosition[] = [];
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private toastrService: NbToastrService
  ) {
    this.captionForm = this.formBuilder.group({
      captions: this.formBuilder.array([this.createText()]),
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

  get captionFields(): FormArray {
    return this.captionForm.get('captions') as FormArray;
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

  onDragEnded(event: CdkDragEnd, index: number) {
    this.textCoordinates[index] = event.source.getFreeDragPosition();
  }

  imageChange(event: any) {
    var img = new Image();
    let self = this;
    img.onload = function () {
      const aspectRatio = img.width / img.height;
      const width = 600;
      const height = width / aspectRatio;
      self.myCanvas.nativeElement.width = width;
      self.myCanvas.nativeElement.height = height;
      self.context.drawImage(img, 0, 0, width, height);
      // self.base64Canvas = self.myCanvas.nativeElement.toDataURL();
      self.imgSrc = self.myCanvas.nativeElement.toDataURL();
    };
    img.src = URL.createObjectURL(event.target.files[0]);
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
      case 'filter':
        this.filteringImage = true;
    }
  }

  async createImage() {
    this.isLoading = true;
    const payload = {
      html: `<div id="container">${this.getCaptionsHTML()}<img src="${
        this.imgSrc
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
      auth: environment.HTMLToCSSAuth,
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
      let downloadSrc = (response.data as any).url;
      this.downloadImage(downloadSrc);
    } catch (error) {
      this.toastrService.danger(error, 'ERROR');
      console.error(error);
    } finally {
      this.isLoading = false;
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

  ngOnInit() {}
}
