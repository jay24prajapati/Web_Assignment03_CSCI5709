import { CreateRestaurantBody } from "../types";

export const validateRestaurantData = (data: CreateRestaurantBody): boolean => {
    const { name, location, cuisine, description, openingHours } = data;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return false;
    }
    if (!location || typeof location !== 'string' || location.trim() === '') {
        return false;
    }
    if (!cuisine || typeof cuisine !== 'string' || cuisine.trim() === '') {
        return false;
    }
    if (description && typeof description !== 'string') {
        return false;
    }
    if (openingHours && typeof openingHours !== 'object') {
        return false;
    }

    return true;
}