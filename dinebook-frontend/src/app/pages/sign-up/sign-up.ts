import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { MatButtonModule } from "@angular/material/button"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatIconModule } from "@angular/material/icon"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { ApiService } from "../../services/api.service"
import { Router, RouterLink } from "@angular/router"

@Component({
  selector: "app-sign-up",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
    RouterLink,
  ],
  templateUrl: "./sign-up.html",
  styleUrl: "./sign-up.scss",
})
export class SignUpComponent {
  signUpForm: FormGroup
  errorMessage = ""
  isLoading = false
  hidePassword = true

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
  ) {
    this.signUpForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      role: ["customer", Validators.required],
      name: ["", Validators.required],
    })
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword
  }

  getNameErrorId(): string {
    return "name-error-" + Math.random().toString(36).substr(2, 9)
  }

  getEmailErrorId(): string {
    return "email-error-" + Math.random().toString(36).substr(2, 9)
  }

  getPasswordErrorId(): string {
    return "password-error-" + Math.random().toString(36).substr(2, 9)
  }

  getRoleErrorId(): string {
    return "role-error-" + Math.random().toString(36).substr(2, 9)
  }

  getPasswordStrengthClass(): string {
    const password = this.signUpForm.get("password")?.value || ""
    if (password.length < 6) return "weak"
    if (password.length < 10) return "medium"
    return "strong"
  }

  getPasswordStrengthText(): string {
    const password = this.signUpForm.get("password")?.value || ""
    if (password.length < 6) return "Weak password"
    if (password.length < 10) return "Medium strength"
    return "Strong password"
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this.isLoading = true
      this.errorMessage = ""
      this.apiService.register(this.signUpForm.value).subscribe({
        next: () => {
          this.isLoading = false
          this.errorMessage = "Registration successful! Please check your email to verify your account."
          setTimeout(() => this.router.navigate(["/sign-in"]), 3000) // Redirect after 3s
        },
        error: (err) => {
          this.isLoading = false
          this.errorMessage = err.error.message || "Registration failed"
        },
      })
    }
  }
}
