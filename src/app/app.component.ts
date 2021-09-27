import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('myCanvas', { static: false }) myCanvas!: ElementRef;
  public context!: CanvasRenderingContext2D;
  imgSrc: string = '';
  insertingText = false;
  taggingPeople = false;
  taggedPeople: any[] = [];
  textToDraw: any[] = [
    { text: '', color: '#000000', fontSize: 12, x: 0, y: 0 },
  ];
  @ViewChild('textValue') textValue!: ElementRef;
  @ViewChild('fontSize') fontSize!: ElementRef;
  @ViewChild('colorValue') colorValue!: ElementRef;

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
    if (this.insertingText) {
      if (this.textToDraw[this.textToDraw.length - 1].text.length > 0) {
        this.textToDraw[this.textToDraw.length - 1].x = event.offsetX;
        this.textToDraw[this.textToDraw.length - 1].y = event.offsetY;
        this.textToDraw[this.textToDraw.length] = {
          text: '',
          color: '#000000',
          fontSize: 12,
          x: 0,
          y: 0,
        };
        this.resetTextInput();
      }
      console.log(this.textToDraw);
      this.drawTextOver();
    } else if (this.taggingPeople) {
      this.taggedPeople[this.taggedPeople.length - 1].x = event.offsetX + 'px';
      this.taggedPeople[this.taggedPeople.length - 1].y = event.offsetY + 'px';
    }
    console.log(this.taggedPeople);
  }

  resetTextInput() {
    this.textValue.nativeElement.value = '';
    this.fontSize.nativeElement.value = 12;
    this.colorValue.nativeElement.value = '#000000';
  }

  drawTextOver() {
    var img = new Image();
    let self = this;
    img.onload = function () {
      self.context.drawImage(img, 0, 0);
      for (let i of self.textToDraw) {
        self.context.font = `${i.fontSize}px Calibri`;
        self.context.fillStyle = i.color;
        self.context.fillText(i.text, i.x, i.y);
      }
    };
    img.src = this.imgSrc;
    console.log(this.myCanvas.nativeElement.toDataURL());
  }

  textChange(event: any) {
    this.textToDraw[this.textToDraw.length - 1].text = event.target.value;
    console.log(this.textToDraw);
  }

  fontSizeChange(event: any) {
    this.textToDraw[this.textToDraw.length - 1].fontSize = event.target.value;
    console.log(this.textToDraw);
  }

  colorChange(event: any) {
    this.textToDraw[this.textToDraw.length - 1].color = event.target.value;
    console.log(this.textToDraw);
  }

  personChange(event: any) {
    let newPerson = { profile: event.target.value };
    this.taggedPeople.push(newPerson);
  }

  insertText() {
    this.insertingText = !this.insertingText;
    this.taggingPeople = false;
  }

  tagPeople() {
    this.taggingPeople = !this.taggingPeople;
    this.insertingText = false;
  }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');
  }
}
