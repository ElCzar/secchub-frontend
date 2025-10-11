import { Injectable, Inject, DOCUMENT } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarToggleService {
  private readonly sidebarVisibleSubject = new BehaviorSubject<boolean>(true);
  
  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    // Inicializar la clase CSS del body
    this.updateBodyClass(true);
    
    // Suscribirse a cambios para actualizar la clase del body
    this.sidebarVisible$.subscribe(visible => {
      this.updateBodyClass(visible);
    });
  }
  
  get sidebarVisible$(): Observable<boolean> {
    return this.sidebarVisibleSubject.asObservable();
  }
  
  get isSidebarVisible(): boolean {
    return this.sidebarVisibleSubject.value;
  }
  
  toggleSidebar(): void {
    this.sidebarVisibleSubject.next(!this.sidebarVisibleSubject.value);
  }
  
  closeSidebar(): void {
    this.sidebarVisibleSubject.next(false);
  }
  
  openSidebar(): void {
    this.sidebarVisibleSubject.next(true);
  }
  
  private updateBodyClass(visible: boolean): void {
    const body = this.document.body;
    if (visible) {
      body.classList.remove('sidebar-hidden');
      body.classList.add('sidebar-visible');
    } else {
      body.classList.remove('sidebar-visible');
      body.classList.add('sidebar-hidden');
    }
  }
}