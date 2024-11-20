import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
function promptUser(event: VersionReadyEvent): boolean {
  return true;
}
@Injectable({ providedIn: 'root' })
export class PromptUpdateService {
  constructor(swUpdate: SwUpdate) {
    console.log('PromptUpdateService constructor');
    if (swUpdate.isEnabled) {
      swUpdate.versionUpdates
        .pipe(
          filter(
            (evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY',
          ),
        )
        .subscribe((evt) => {
          if (promptUser(evt)) {
            // Reload the page to update to the latest version.
            console.log('Prompting user to update to the latest version');
            document.location.reload();
          }
        });
    }
  }
}
