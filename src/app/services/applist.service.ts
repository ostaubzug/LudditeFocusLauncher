import {BehaviorSubject, forkJoin, mergeWith, Observable} from 'rxjs';
import {App} from '../models/app.interface';
import {Injectable} from '@angular/core';
import {WebAppListService} from './webapplist.service';
import {NativeAppListService} from './nativeapplist.service';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppListService {
  private combinedAppsSubject = new BehaviorSubject<App[]>([]);
  public apps$ = this.combinedAppsSubject.asObservable();

  constructor(
    private webAppService: WebAppListService,
    private nativeAppService: NativeAppListService
  ) {
    this.combineApps();

    this.webAppService.apps$.pipe(
      mergeWith(this.nativeAppService.apps$)
    ).subscribe(() => {
      this.combineApps();
    });
  }

  private combineApps(): void {
    const webApps = this.webAppService.getAppList().map(webApp => ({
      ...webApp,
      type: 'webApp'
    }));

    const nativeApps = this.nativeAppService.getAppList().map(nativeApp => ({
      ...nativeApp,
      type: 'nativeApp',
      url: nativeApp.uri,
      timeLimit: "0"

    }));

    this.combinedAppsSubject.next([...webApps, ...nativeApps]);
  }

  syncAll(): Observable<App[]> {
    return forkJoin({
      web: this.webAppService.syncWithServer(),
      native: this.nativeAppService.syncWithServer()
    }).pipe(
      map(() => this.combinedAppsSubject.value)
    );
  }
}
