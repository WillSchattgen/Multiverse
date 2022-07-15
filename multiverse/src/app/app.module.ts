import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { SphereMapComponent } from './sphere-map/sphere-map.component';
import { ShardgateComponent } from './shardgate/shardgate.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { MazeComponent } from './maze/maze.component';
import { SphereEditorComponent } from './sphere-editor/sphere-editor.component';
import { ArchiveComponent } from './archive/archive.component';
import { CampaignComponent } from './campaign/campaign.component';
import { CampaignMapComponent } from './campaign-map/campaign-map.component';

const routes: Routes = [
  { path: 'spheremap', component: SphereMapComponent },
  { path: 'shardgate', component: ShardgateComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'maze', component: MazeComponent },
  { path: 'sphere-editor', component: SphereEditorComponent },
  { path: 'archive', component: ArchiveComponent },
  { path: 'campaign', component: CampaignComponent},
  { path: 'campaign-map', component: CampaignMapComponent},
  { path: '', redirectTo: 'welcome', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    SphereMapComponent,
    ShardgateComponent,
    WelcomeComponent,
    MazeComponent,
    SphereEditorComponent,
    ArchiveComponent,
    CampaignComponent,
    CampaignComponent,
    CampaignMapComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes)// Add this for view navigation
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
