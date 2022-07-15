import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['./maze.component.css']
})
export class MazeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

}
