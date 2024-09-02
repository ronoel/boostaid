import { Routes } from '@angular/router';
import { HomeComponent } from './page/home/home.component';

export const routes: Routes = [
    // {
    //     path: '',
    //     redirectTo: 'home',
    //     pathMatch: 'full'
    // },
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full'
    },
    {
        path: 'v1',
        loadChildren: () => import('./page/v1/v1-routing.module').then(m => m.V1RoutingModule)
    },
    {
        path: 'manager',
        loadComponent: () => import('./page/v1/manager/collect-tax/collect-tax.component').then(c => c.CollectTaxComponent)
    }
    // { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
];
