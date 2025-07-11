import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { Router, RouterLink } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { BookingService } from "../../services/booking.service"
import { Restaurant } from "../../models/booking"

interface RestaurantDisplay extends Restaurant {
  badge: string
  badgeClass: string
  stars: string[]
  priceRangeDisplay: string
}

@Component({
  selector: "app-restaurants",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: "./restaurants.html",
  styleUrl: "./restaurants.scss",
})
export class RestaurantsComponent implements OnInit {
  restaurants: RestaurantDisplay[] = []
  loading = false
  error: string | null = null

  constructor(
    private authService: AuthService,
    private router: Router,
    private bookingService: BookingService
  ) { }

  ngOnInit() {
    this.loadRestaurants()
  }

  loadRestaurants() {
    this.loading = true
    this.error = null

    this.bookingService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants.map(restaurant => this.transformRestaurant(restaurant))
        this.loading = false
        console.log('Loaded restaurants:', this.restaurants)
      },
      error: (error) => {
        console.error('Error loading restaurants:', error)

        // Check if it's a network error (API not available)
        if (error.message.includes('Failed to fetch') || error.status === 0) {
          this.error = 'Unable to connect to the server. Please check your connection and try again.'
        } else {
          this.error = error.message || 'Failed to load restaurants. Please try again later.'
        }

        this.loading = false
        this.restaurants = []
      }
    })
  }

  private transformRestaurant(restaurant: Restaurant): RestaurantDisplay {
    return {
      ...restaurant,
      badge: this.getBadge(restaurant),
      badgeClass: this.getBadgeClass(restaurant),
      stars: this.getStars(restaurant.rating || restaurant.averageRating || 0),
      priceRangeDisplay: this.formatPriceRange(restaurant.priceRange),
    }
  }

  private getBadge(restaurant: Restaurant): string {
    // Simple logic for badges - you can enhance this based on your business logic
    if (restaurant.averageRating && restaurant.averageRating >= 4.8) {
      return "Featured"
    } else if (restaurant.averageRating && restaurant.averageRating >= 4.5) {
      return "Popular"
    } else {
      return "New"
    }
  }

  private getBadgeClass(restaurant: Restaurant): string {
    const badge = this.getBadge(restaurant)
    return badge.toLowerCase()
  }

  private getStars(rating: number): string[] {
    const stars: string[] = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push("star")
    }

    if (hasHalfStar) {
      stars.push("star_half")
    }

    // Fill remaining with empty stars up to 5
    while (stars.length < 5) {
      stars.push("star_border")
    }

    return stars
  }

  private formatPriceRange(priceRange: number): string {
    const priceRanges = {
      1: "10-20 $",
      2: "20-40 $",
      3: "40-60 $",
      4: "60+ $"
    }
    return priceRanges[priceRange as keyof typeof priceRanges] || "Price varies"
  }

  bookTable() {
    if (this.authService.isLoggedIn) {
      this.router.navigate(["/book-table"])
    } else {
      this.router.navigate(["/sign-in"])
    }
  }

  bookTableForRestaurant(restaurant: RestaurantDisplay) {
    if (this.authService.isLoggedIn) {
      this.router.navigate(["/book-table"], {
        queryParams: {
          restaurantId: restaurant._id,
          restaurantName: restaurant.name,
          cuisine: restaurant.cuisine,
          location: restaurant.location
        }
      })
    } else {
      this.router.navigate(["/sign-in"])
    }
  }

  retry() {
    this.loadRestaurants()
  }
}
