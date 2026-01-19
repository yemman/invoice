import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../services/invoice.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      
      <!-- Inventory Needs Card -->
      <div class="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
          <div>
            <h3 class="font-bold text-slate-800 text-lg">Inventory Sold</h3>
            <p class="text-sm text-slate-500">Total units sold across all invoices</p>
          </div>
          <div class="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
        </div>
        <div class="overflow-y-auto p-0 grow">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0">
              <tr>
                <th class="px-5 py-3 border-b">Product Name</th>
                <th class="px-5 py-3 border-b text-right">Units Sold</th>
                <th class="px-5 py-3 border-b w-1/3">Demand Level</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (item of invoiceService.inventoryNeeds(); track item.name) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-3 font-medium text-slate-700 capitalize">{{ item.name }}</td>
                  <td class="px-5 py-3 text-right font-mono text-slate-600">{{ item.total | number }}</td>
                  <td class="px-5 py-3">
                    <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <!-- Simple visual bar proportional to quantity (mock scaling for demo) -->
                      <div class="h-full bg-orange-400 rounded-full" [style.width.%]="(item.total / 100) * 100"></div>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3" class="p-8 text-center text-slate-400">
                    No data available. Process invoices to see inventory needs.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Accounts Receivable Card -->
      <div class="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white">
          <div>
            <h3 class="font-bold text-slate-800 text-lg">Accounts Receivable</h3>
            <p class="text-sm text-slate-500">Outstanding payments by customer</p>
          </div>
          <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="overflow-y-auto p-0 grow">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0">
              <tr>
                <th class="px-5 py-3 border-b">Customer</th>
                <th class="px-5 py-3 border-b text-right">Total Owed</th>
                <th class="px-5 py-3 border-b text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (client of invoiceService.accountsReceivable(); track client.customer) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-3 font-medium text-slate-700">{{ client.customer }}</td>
                  <td class="px-5 py-3 text-right font-mono text-emerald-700 font-bold">{{ client.amount | currency }}</td>
                  <td class="px-5 py-3 text-right">
                    <button class="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 hover:bg-indigo-50 px-2 py-1 rounded">
                      Send Reminder
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3" class="p-8 text-center text-slate-400">
                    No outstanding invoices found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  `
})
export class DashboardComponent {
  invoiceService = inject(InvoiceService);
}