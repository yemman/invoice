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

  constructor(public catalogService: CatalogService) {}

  openManage() {
    this.manage.emit();
  }
}
