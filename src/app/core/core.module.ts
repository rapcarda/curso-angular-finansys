import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
// Para configurar interceptação de requisições do plugin in-memory-database
// Quando usar serviço real, deve-se remover estas chamadas, e o arquivo in-memory-database.ts
import { HttpClientInMemoryWebApiModule, InMemoryDbService } from 'angular-in-memory-web-api';
import { InMemoryDatabase } from '../in-memory-database';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';



@NgModule({
  declarations: [NavBarComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    // Para interceptar requisições com o in-memory-database
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDatabase)
  ],
  exports: [
    // shared modules
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // Shared Components
    NavBarComponent
  ]
})
export class CoreModule { }
