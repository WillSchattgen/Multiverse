import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { SphereMapComponent } from './sphere-map/sphere-map.component';
import { ShardgateComponent } from './shardgate/shardgate.component';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  { path: 'spheremap', component: SphereMapComponent },
  { path: 'shardgate', component: ShardgateComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: '', redirectTo: 'welcome', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    SphereMapComponent,
    ShardgateComponent,
    WelcomeComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)// Add this for view navigation
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
