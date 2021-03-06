import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';
import { GoogleMapComponent } from '../pages/google-map/google-map';
import { GoogleMapPlacesComponent } from '../pages/google-map/google-map-places';
import { NotesListComponent } from '../pages/notes-list/notes-list';
import { NotesDetailComponent } from '../pages/notes-detail/notes-detail';
import { PopOverComponent } from '../pages/popover/popover';

@NgModule({
  declarations: [
    MyApp,
    HelloIonicPage,
    ItemDetailsPage,
    ListPage,
    GoogleMapComponent,
    GoogleMapPlacesComponent,
    NotesListComponent,
    NotesDetailComponent,
    PopOverComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HelloIonicPage,
    ItemDetailsPage,
    ListPage,
    GoogleMapComponent,
    GoogleMapPlacesComponent,
    NotesListComponent,
    NotesDetailComponent,
    PopOverComponent
  ],
  providers: []
})
export class AppModule {}
