import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../../services/catalog.service';
import { ExpandableCardService } from '../../../services/expandable-card.service';

@Component({
  selector: 'app-catalog-card',
  standalone: true,
  imports: [CommonModule],
  providers: [ExpandableCardService],
  templateUrl: './catalog-card.component.html',
  styleUrls: ['./catalog-card.component.css']
})
export class CatalogCardComponent {
  @Output() manage = new EventEmitter<void>();
  protected expandableCard = inject(ExpandableCardService);

  constructor(public catalogService: CatalogService) {}

  openManage() {
    this.manage.emit();
  }

  toggleExpand() {
    this.expandableCard.toggleExpand();
  }

  get expanded() {
    return this.expandableCard.expanded();
  }
}
