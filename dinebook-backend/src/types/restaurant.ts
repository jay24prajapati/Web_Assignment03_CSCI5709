export enum CuisineType {
    Italian = "Italian",
    Indian = "Indian",
    Chinese = "Chinese",
    Mexican = "Mexican",
    American = "American",
    Thai = "Thai",
    Japanese = "Japanese",
    Mediterranean = "Mediterranean",
    French = "French",
    Other = "Other",
}

export interface AuthenticatedRequest extends Request {
    user: {
        _id: string;
        [key: string]: any;
    };
}

// Interface for restaurant query parameters
export interface RestaurantQueryParams {
    location?: string;
    cuisine?: CuisineType;
    priceRange?: string;
    page?: string;
    limit?: string;
}

// Interface for restaurant creation body
export interface CreateRestaurantBody {
    name: string;
    cuisine: CuisineType;
    location: string;
    priceRange: number;
    description?: string;
    phoneNumber?: string;
    email?: string;
    capacity?: number;
}
