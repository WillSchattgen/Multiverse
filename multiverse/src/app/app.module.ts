import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { SphereMapComponent } from './sphere-map/sphere-map.component';

const routes: Routes = [
  { path: 'spheremap', component: SphereMapComponent },
  { path: '', redirectTo: 'welcome', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    SphereMapComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)// Add this for view navigation
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
