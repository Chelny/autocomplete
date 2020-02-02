import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { tap, catchError, delay } from 'rxjs/operators';
import { throwError } from 'rxjs/index';
import { Fruit } from '../models/fruit';

@Injectable()
export class FruitService {
  private fruits: Fruit[];
  private loadingFruits = new Subject<boolean>();
  public loadingFruits$ = this.loadingFruits.asObservable();

  constructor() {
    this.fruits = [
      { id: 1, name: "Apple", colour: "red" },
      { id: 2, name: "Banana", colour: "yellow" },
      { id: 3, name: "Blueberry", colour: "blue" },
      { id: 4, name: "Blackberry", colour: "black" },
      { id: 5, name: "Orange", colour: "orange" },
      { id: 6, name: "Peach", colour: "orange" },
      { id: 7, name: "Pear", colour: "green" },
      { id: 8, name: "Pineapple", colour: "orange" },
      { id: 9, name: "Strawberry", colour: "red" },
      { id: 10, name: "Raspberry", colour: "red" },
      { id: 11, name: "Watermelon", colour: "red" },
      { id: 12, name: "Cantaloupe", colour: "orange" },
      { id: 13, name: "Honeydew", colour: "green" },
      { id: 14, name: "Kiwifruit", colour: "green" },
      { id: 15, name: "Plum", colour: "purple" },
      { id: 16, name: "Cherry", colour: "red" },
      { id: 17, name: "Grape", colour: "green" },
      { id: 18, name: "Tomato", colour: "red" },
      { id: 19, name: "Mango", colour: "orange" },
      { id: 20, name: "Avocado", colour: "green" }
    ];
  }

  public getFruits(): Observable<Fruit[]> {
    this.loadingFruits.next(true);

    return of(this.fruits).pipe(
      delay(1000),
      catchError((error: any) => {
        this.loadingFruits.next(false);
        console.error('Handling error locally and rethrowing it...', error);
        return throwError(error);
      }),
      tap((fruits: Fruit[]) => {
        this.loadingFruits.next(false);
        // console.log('List of fruits', fruits);
      })
    );
  }
}