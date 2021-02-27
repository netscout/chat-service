import { Component, OnInit } from '@angular/core';
import { BaseFormComponent } from '../shared/base.form.component';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent
  extends BaseFormComponent
  implements OnInit {

  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,) {
    super();
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    //로그인 폼과 각 필드의 제약 조건을 설정
    this.form = this.formBuilder
    .group({
      name: ['',
        [
          Validators.required
        ]
      ]
    });
  }

  onSubmit() {
    this.loading = true;

    let name = this.getValue("name");
    this.authService.login(name);

    this.router.navigate(['/lobby']);
  }
}
