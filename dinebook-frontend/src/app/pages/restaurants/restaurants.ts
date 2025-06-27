import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { Router, RouterLink } from "@angular/router"
import { AuthService } from "../../services/auth.service"

interface Restaurant {
  name: string
  cuisine: string
  rating: string
  reviews: number
  location: string
  timing: string
  priceRange: string
  badge: string
  badgeClass: string
  stars: string[]
}

@Component({
  selector: "app-restaurants",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: "./restaurants.html",
  styleUrl: "./restaurants.scss",
})
export class RestaurantsComponent {
  mockRestaurants: Restaurant[] = [
    {
      name: "The Garden Bistro",
      cuisine: "Modern European",
      rating: "4.8",
      reviews: 124,
      location: "Downtown",
      timing: "Open until 11 PM",
      priceRange: "30-40 $",
      badge: "Featured",
      badgeClass: "featured",
      stars: ["star", "star", "star", "star", "star"],
    },
    {
      name: "Spice Route",
      cuisine: "Indian Fusion",
      rating: "4.6",
      reviews: 89,
      location: "Midtown",
      timing: "Open until 10 PM",
      priceRange: "80-100 $",
      badge: "Popular",
      badgeClass: "popular",
      stars: ["star", "star", "star", "star", "star_half"],
    },
    {
      name: "Ocean View",
      cuisine: "Fresh Seafood",
      rating: "4.9",
      reviews: 156,
      location: "Waterfront",
      timing: "Open until 12 AM",
      priceRange: "40-50 $",
      badge: "New",
      badgeClass: "new",
      stars: ["star", "star", "star", "star", "star"],
    },
  ]

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  bookTable() {
    if (this.authService.isLoggedIn) {
      alert("Table booking functionality")
    } else {
      this.router.navigate(["/sign-in"])
    }
  }
}
