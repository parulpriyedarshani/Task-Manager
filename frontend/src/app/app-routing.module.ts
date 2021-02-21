import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { TaskviewComponent } from './pages/taskview/taskview.component';
import { TaskService } from './task.service';

const routes: Routes = [
  {path: '', redirectTo: 'lists', pathMatch: 'full'},
  {path: 'new-list', component: NewListComponent},
  {path: 'login', component: LoginPageComponent},
  {path: 'lists', component: TaskviewComponent},
  {path: 'lists/:listId', component: TaskviewComponent},
  {path: 'lists/:listId/new-task', component: NewTaskComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
