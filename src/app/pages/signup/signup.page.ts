import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  constructor(private authSvc: AuthService, private router: Router) {}

  ngOnInit() {}

  async onSignup(){
    try {

    }
    catch (error) {console.log('Error', error)}
  }
}
