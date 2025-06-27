import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterLink } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatCardModule } from "@angular/material/card"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { ActivatedRoute } from "@angular/router"
import { ApiService } from "../../services/api.service"
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: "app-verify",
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule],
  template: `
  <div class="verify-page">
    <div class="verify-container animate-fade-in">
      <!-- Header Section -->
      <div class="verify-header">
        <div class="verify-logo">
          <a routerLink="/landing" class="logo-link" aria-label="Back to home">
            <span class="logo-text">DineBook</span>
          </a>
        </div>
      </div>
      
      <mat-card class="verify-card">
        <mat-card-content class="verify-content">
          <!-- Verifying State -->
          <div *ngIf="isVerifying" class="verify-state verifying" role="status" aria-live="polite">
            <div class="verify-icon">
              <mat-spinner diameter="48" aria-label="Verifying email"></mat-spinner>
            </div>
            <h2 class="verify-title">Verifying Your Email</h2>
            <p class="verify-description">Please wait while we verify your email address...</p>
          </div>
          
          <!-- Success State -->
          <div *ngIf="verificationSuccess" class="verify-state success">
            <div class="verify-icon success-icon">
              <mat-icon class="large-icon">check_circle</mat-icon>
            </div>
            <h2 class="verify-title">Email Verified!</h2>
            <p class="verify-description">
              Your email has been successfully verified. You can now sign in to your account and start exploring amazing restaurants.
            </p>
            <div class="verify-actions">
              <button mat-raised-button color="primary" routerLink="/sign-in" class="action-button">
                <mat-icon>login</mat-icon>
                Continue to Sign In
              </button>
            </div>
          </div>
          
          <!-- Error State -->
          <div *ngIf="verificationError" class="verify-state error">
            <div class="verify-icon error-icon">
              <mat-icon class="large-icon">error_outline</mat-icon>
            </div>
            <h2 class="verify-title">Verification Failed</h2>
            <p class="verify-description">
              The verification link is invalid or has expired. Please try registering again with a new account.
            </p>
            <div class="verify-actions">
              <button mat-raised-button color="primary" routerLink="/sign-up" class="action-button">
                <mat-icon>person_add</mat-icon>
                Create New Account
              </button>
              <button mat-button routerLink="/sign-in" class="secondary-button">
                <mat-icon>arrow_back</mat-icon>
                Back to Sign In
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  </div>
`,
  styles: [
    `
    .verify-page {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
        pointer-events: none;
      }
    }

    .verify-container {
      width: 100%;
      max-width: 480px;
      position: relative;
      z-index: 1;
    }

    .verify-header {
      text-align: center;
      margin-bottom: 2rem;
      
      .verify-logo {
        margin-bottom: 1rem;
        
        .logo-link {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          padding: 0.5rem;
          border-radius: var(--border-radius-lg);
          transition: var(--transition-fast);
          
          &:hover {
            background-color: rgba(255, 255, 255, 0.8);
          }
          
          &:focus {
            outline: 2px solid var(--primary-500);
            outline-offset: 2px;
          }
          
          .logo-text {
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.025em;
          }
        }
      }
    }

    .verify-card {
      background: var(--surface);
      border-radius: var(--border-radius-xl);
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--gray-200);
      backdrop-filter: blur(10px);
    }

    .verify-content {
      padding: 3rem 2rem;
      text-align: center;
    }

    .verify-state {
      .verify-icon {
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        
        .large-icon {
          font-size: 4rem;
          width: 4rem;
          height: 4rem;
        }
        
        &.success-icon .large-icon {
          color: var(--success-500);
        }
        
        &.error-icon .large-icon {
          color: var(--error-500);
        }
      }

      .verify-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--gray-900);
        margin: 0 0 1rem;
        letter-spacing: -0.025em;
      }

      .verify-description {
        color: var(--gray-600);
        font-size: 1rem;
        line-height: 1.6;
        margin: 0 0 2rem;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
      }

      .verify-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        align-items: center;

        .action-button {
          width: 100%;
          max-width: 280px;
          height: 48px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          
          mat-icon {
            font-size: 1.25rem;
            width: 1.25rem;
            height: 1.25rem;
          }
        }

        .secondary-button {
          color: var(--gray-600);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          
          &:hover {
            background-color: var(--gray-100);
            color: var(--gray-700);
          }
          
          mat-icon {
            font-size: 1rem;
            width: 1rem;
            height: 1rem;
          }
        }
      }

      &.success {
        .verify-title {
          color: var(--success-600);
        }
      }

      &.error {
        .verify-title {
          color: var(--error-600);
        }
      }
    }

    @media (max-width: 480px) {
      .verify-content {
        padding: 2rem 1.5rem;
      }
      
      .verify-state {
        .verify-title {
          font-size: 1.5rem;
        }
        
        .verify-description {
          font-size: 0.95rem;
        }
        
        .verify-icon .large-icon {
          font-size: 3rem;
          width: 3rem;
          height: 3rem;
        }
      }
    }
  `,
  ],
})
export class VerifyComponent implements OnInit {
  isVerifying = true
  verificationSuccess = false
  verificationError = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get("token")
    if (token) {
      this.apiService.verifyEmail(token).subscribe({
        next: () => {
          this.isVerifying = false
          this.verificationSuccess = true
        },
        error: () => {
          this.isVerifying = false
          this.verificationError = true
        },
      })
    } else {
      this.isVerifying = false
      this.verificationError = true
    }
  }
}
