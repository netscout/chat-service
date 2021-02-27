import { Component } from "@angular/core";
import { FormGroup, AbstractControl } from "@angular/forms";

@Component({
  template: ''
})
export class BaseFormComponent {
  form: FormGroup

  constructor(
  ) {
  }

  //FormControl 가져오기
  getControl(name: string) {
    return this.form.get(name);
  }

  //FormControl의 값 가져오기
  getValue(name: string) {
    let result = null;
    let c = this.getControl(name);

    if(c) {
      result = c.value;
    }

    return result;
  }

  //FormContorl이 valid상태면 true
  isValid(name: string) {
    let c = this.getControl(name);
    return c && c.valid;
  }

  //FormControl이 변경되었다면 true
  isChanged(name: string) {
    let c = this.getControl(name);
    return c && (c.dirty || c.touched);
  }

  //FormControl에 에러가 있다면.
  hasError(name: string) {
    let c = this.getControl(name);
    return c && (c.dirty || c.touched) && c.invalid;
  }

  //FormControl에 Required인 값이 입력되지 않았다면
  hasRequiredError(name: string) {
    let c = this.getControl(name);
    return c && c.errors?.required;
  }

  //FormControl에 입력된 값이 Regex패턴과 맞지 않는다면
  hasPatternError(name: string) {
    let c = this.getControl(name);
    return c && c.errors?.pattern;
  }

  //FormControl에 입력된 값의 최소 / 최대 값이 맞지 않는다면
  hasMinOrMaxError(name: string) {
    let c = this.getControl(name);
    return c && (c.errors?.min || c.errors?.max);
  }

  //FormControl에 입력된 값이 이미 존재하는 값이라면
  hasDupeFieldError(name: string) {
    let c = this.getControl(name);
    return c && c.errors?.isDupeField;
  }

  //패스워드와 패스워드 확인이 같지 않은 에러가 있다면
  hasNotPasswordMatchError() {
    return this.form.errors?.passwordMatchInvalid;
  }

  //패스워드와 패스워드 확인이 같은지 검사
  checkPasswordConfirm(c: AbstractControl):
  { passwordMatchInvalid: boolean} {
    let p = c.get("password").value;
    let cp = c.get("confirmPassword").value;
    if(p !== cp) {
      return { passwordMatchInvalid: true };
    }
  }
}
