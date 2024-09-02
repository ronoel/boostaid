import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./fund/fund.component').then(c => c.FundComponent)
  },
  {
    path: 'nft',
    loadComponent: () => import('./nft/nft.component').then(c => c.NftComponent)
  },
  {
    path: 'nft/fundraiser/create',
    loadComponent: () => import('./nft/fundraiser/fundraiser.component').then(c => c.FundraiserComponent)
  },
  {
    path: 'nft/promoter/create',
    loadComponent: () => import('./nft/promoter/promoter.component').then(c => c.PromoterComponent)
  },
  {
    path: 'campaign',
    loadComponent: () => import('./campaign/campaign.component').then(c => c.CampaignComponent)
  },
  {
    path: 'campaign/create',
    loadComponent: () => import('./campaign/campaign-create/campaign-create.component').then(c => c.CampaignCreateComponent)
  },
  {
    path: 'campaign/:id',
    loadComponent: () => import('./campaign/campaign-detail/campaign-detail.component').then(c => c.CampaignDetailComponent)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class V1RoutingModule { }
