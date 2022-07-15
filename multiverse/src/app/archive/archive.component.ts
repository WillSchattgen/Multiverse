import { Component, OnInit } from '@angular/core';
import { Book } from '../book';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})
export class ArchiveComponent implements OnInit {

  books: Book[] = [];
  showModal: boolean = false;
  selectedBook: Book | undefined;

  constructor() { }

  ngOnInit(): void {
    var firstBook = new Book();
    firstBook.name = "First Book";
    this.books.push(firstBook);
  }

  view(book: Book){
    this.selectedBook = book;
    this.showModal = true;
  }

  toggleModal(){
    this.showModal = !this.showModal;
  }

}
