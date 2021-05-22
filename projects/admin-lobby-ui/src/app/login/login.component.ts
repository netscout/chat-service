import { Component, OnInit } from '@angular/core';
import { BaseFormComponent } from '../shared/base.form.component';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

import { AuthenticationService } from '../services/authentication.service';
import { Role } from '../models/role';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent
  extends BaseFormComponent
  implements OnInit {
  currentRole: number;

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
      ],
      role: ['',
        [
          Validators.required
        ]
      ]
    });
  }

  onSubmit() {
    this.loading = true;

    //TODO: 사용자 고유 식별자는 DB에서 가져오도록
    const id = uuidv4();
    const name = this.getValue("name");
    const roleId = +this.getValue("role");
    this.authService.login(id, name, roleId);

    this.router.navigate(['/lobby']);
  }

  roleSelectionChanged(role: Role) {
    this.currentRole = role.id;
    console.log('info',`role changed: ${role.title}`)
  }
}
