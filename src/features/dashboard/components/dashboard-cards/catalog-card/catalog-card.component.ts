import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../../../../core/services/data/catalog.service';
import { ExpandableCardService } from '../../../../../shared/services/expandable-card.service';
import { exportToCsv } from '../../../../../shared/utils/export.utils';

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

  exportToCsv() {
    const data = this.catalogService.catalog();
    const rows = [
      ['ID', 'Index', 'Name', 'Box Quantity', 'Unit Price', 'Is Print'],
      ...data.map(item => [
        item.id,
        item.index,
        item.name,
        item.box_quantety || '',
        item.unit_price,
        item.is_print ? 'Yes' : 'No'
      ])
    ];
    exportToCsv('Catalog', rows);
  }
}
