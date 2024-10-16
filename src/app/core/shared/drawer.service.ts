import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  // Define available items for selection
  private availableItems: string[] = ['audio', 'effects', 'generators', 'notes'];

  // BehaviorSubjects for drawer state and selected item
  private drawerState = new BehaviorSubject<boolean>(false);
  private selectedItem = new BehaviorSubject<string>('audio');

  // Observable for components to subscribe to
  drawerState$ = this.drawerState.asObservable();
  selectedItem$: Observable<string> = this.selectedItem
    .asObservable()
    .pipe(
      filter(item => this.availableItems.includes(item)) // Filter the selection
    );

  // Method to toggle the drawer state
  toggleDrawer() {
    this.drawerState.next(!this.drawerState.value);
  }

  // Method to select item only if it is in availableItems
  selectItem(item: string) {
    if (this.availableItems.includes(item)) {
      this.selectedItem.next(item);
    } else {
      console.error('Selected item is not available:', item);
    }
  }

  // Optionally, provide a method to update available items dynamically
  setAvailableItems(items: string[]) {
    this.availableItems = items;
  }

  // Methods to explicitly open and close the drawer
  openDrawer() {
    this.drawerState.next(true);
  }

  closeDrawer() {
    this.drawerState.next(false);
  }
}
