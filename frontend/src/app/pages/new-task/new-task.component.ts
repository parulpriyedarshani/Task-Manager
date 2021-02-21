import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';
import { Task } from 'src/app/models/task.model';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {
  // using route here to create a new task.
  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

  listId: string;

  ngOnInit(): void {
    // to get the listId
    this.route.params.subscribe(
      (params: Params) => {
        this.listId = params['listId'];
      }
    )
  }

  createTask(title: string) {
    this.taskService.createTask(title, this.listId).subscribe((newTask: Task) => {
      
      // to redirect us back to the taskview so that we can see the task use the router.navigate.
      this.router.navigate(['../', { relativeTo: this.route }]);        // ../ to go back one subroute.
    });
  }

}
