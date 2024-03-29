import { NgModule } from '@angular/core';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { ReviewsComponent } from './components/reviews/reviews.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'organization/:id',
    component: OrganizationComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'organization/:id/reviews',
    component: ReviewsComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
