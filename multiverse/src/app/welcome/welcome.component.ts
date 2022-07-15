import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  toSphereMap(){
    this.router.navigate(['/spheremap']);
  }

  toShardGate(){
    this.router.navigate(['/shardgate']);
  }

  toSphereEditor(){
    this.router.navigate(['/sphere-editor']);
  }

  toMaze(){
    this.router.navigate(['/maze']);
  }

  toArchive(){
    this.router.navigate(['/archive']);
  }

  toCampaign(){
    this.router.navigate(['/campaign']);
  }

  toCampaignMap(){
    this.router.navigate(['/campaign-map']);
  }

}
