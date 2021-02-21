import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TaskService } from 'src/app/task.service';
import { Task } from 'src/app/models/task.model';
import { List } from 'src/app/models/list.model';

@Component({
  selector: 'app-taskview',
  templateUrl: './taskview.component.html',
  styleUrls: ['./taskview.component.scss']
})
export class TaskviewComponent implements OnInit {

  lists: List[];
  tasks: Task[];

  constructor(private taskService: TaskService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    //observable is used here to get the route params (listId)
    this.route.params.subscribe(
      (params: Params) => {
        //console.log(params);  //params allow us to get the route id
        // to show the tasks of a list in the right side and can be seen in the console, can be commented out.
        if (params.listId) {
          this.taskService.getTasks(params.listId).subscribe((tasks: Task[]) => {
            this.tasks = tasks;
          })
        } else {
          this.tasks = undefined;
        }
      }
    )
    
    //to get the lists 
    this.taskService.getLists().subscribe((lists: List[])=> {
      this.lists = lists;
    })
  }

  onTaskClick(task: Task) {
    // we want to set the task to completed.
    this.taskService.complete(task).subscribe(() => {
      // the task has been set to completed successfully
      console.log("Compiled successfully!");
      task.completed = !task.completed;
      
    })
  }

}
