import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../../services/catalog.service';

@Component({
  selector: 'app-catalog-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-card.component.html',
  styleUrls: ['./catalog-card.component.css']
})
export class CatalogCardComponent {
  @Output() manage = new EventEmitter<void>();

  expanded = false;

  constructor(public catalogService: CatalogService) {}

  openManage() {
    this.manage.emit();
  }

  toggleExpand() {
    this.expanded = !this.expanded;
    if (this.expanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
}
