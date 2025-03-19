import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { ChatAppComponent } from './chatapp/chatapp.component';

const routes: Routes = [
  {path:'ChatComponent', component: ChatComponent},
  {path:'ChatAppComponent', component: ChatAppComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
