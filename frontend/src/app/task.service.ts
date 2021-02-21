import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Task } from 'src/app/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestService) {}

 getLists() {
   return this.webReqService.get('lists'); 
 }

 createList(title: string) {
  // We want to create a web request to create a new list as an observable here
  return this.webReqService.post('lists', { title });
 }

 getTasks(listId: string) {
   return this.webReqService.get(`lists/${listId}/tasks`);  // using a template literal here
 }

 createTask(title: string, listId: string) {
  // We want to create a web request to create a new task
  return this.webReqService.post(`lists/${listId}/tasks`, { title });
 }

 complete(task: Task) {
   return this.webReqService.patch(`lists/${task._listId}/tasks/${task._id}`, {
     completed: !task.completed   //opposite of the present value of completed so that the task can be undone accordingly by the user.
  });

 }

}
